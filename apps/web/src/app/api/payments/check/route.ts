import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyBasePayment, BASE_TREASURY, BASE_USDC, BASE_USDT, BASE_USDT_DECIMALS } from '@/lib/base';
import { baseClient } from '@/lib/base';
import { UNLOCK_PRICE_USD } from '@/lib/pricing';

const SOLANA_MAINNET_RPC =
  process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';
const SOLANA_DEVNET_RPC = process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';

const TREASURY_SOLANA = 'HtKPeixUAG5a28rxn4weDqyNfwb8BwSmEp7y7xfZHTf5';
// Token mints the server accepts per chain and asset.
const TOKEN_MINTS: Record<string, string[]> = {
  'solana-mainnet:USDC': ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'],
  'solana-mainnet:USDT': ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'],
  'solana-devnet:USDC': [
    // Course fUSDC (in-app faucet) and Circle's devnet USDC.
    'G5U9iSQwKogEbdQx9DuJ6qFcRyYpkqbtFiafCtLFoHNd',
    '4zMMC9srt5x11eyo7cBJhz9A1JgG3rSBCJ1DoiYaAK',
  ],
};

/** True when the asset is a token rather than the chain's native coin. */
const isTokenAsset = (asset: string) => asset === 'USDC' || asset === 'USDT';

async function getUsdPrice(id: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return data[id]?.usd || 0;
  } catch {
    return 0;
  }
}

/**
 * Records the payment in the `payments` table.
 *
 * The `payments` schema differs between databases — this project ships
 * `tx_hash` / `chain` / status `confirmed`, older ones use `reference` /
 * `signature` / status `paid` — so the row is built from role candidates and
 * corrected from the database error until it inserts. The insert is
 * best-effort: access itself is granted by the `entitlements` table.
 */
async function recordPayment(
  row: {
    txHash: string;
    chain: string;
    wallet: string;
    toWallet: string;
    tokenAmount: number;
    currency: string;
    usdValue: number;
    paidAt: string;
  }
) {
  const roles: { names: string[]; value: unknown }[] = [
    { names: ['tx_hash', 'signature', 'reference'], value: row.txHash },
    { names: ['chain'], value: row.chain },
    { names: ['from_wallet', 'payer_wallet', 'wallet'], value: row.wallet },
    { names: ['to_wallet', 'treasury_wallet'], value: row.toWallet },
    { names: ['amount', 'amount_usdc', 'amount_usd'], value: row.tokenAmount },
    { names: ['currency'], value: row.currency },
    { names: ['status'], value: 'confirmed' },
    { names: ['amount_usdc'], value: row.usdValue },
    { names: ['payer_wallet'], value: row.wallet },
    { names: ['paid_at'], value: row.paidAt },
  ];
  const statusValues = ['confirmed', 'paid', 'completed'];

  const build = () => {
    const payload: Record<string, unknown> = {};
    for (const role of roles) {
      if (!role.names[0]) continue;
      payload[role.names[0]] = role.value;
    }
    return payload;
  };

  const advance = (column: string) => {
    for (let i = 0; i < roles.length; i += 1) {
      const role = roles[i];
      const index = role.names.indexOf(column);
      if (index === -1) continue;
      if (role.names[0] === 'status') {
        const next = statusValues.indexOf(String(role.value)) + 1;
        if (next < statusValues.length) {
          role.value = statusValues[next];
          return true;
        }
        return false;
      }
      if (index + 1 < role.names.length) {
        role.names.splice(index, 1);
        role.value = role.value; // same value under the next column name
        return true;
      }
      // No other name for this role: drop the column entirely.
      role.names = [''];
      return true;
    }
    return false;
  };

  let payload = build();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const { error } = await supabaseAdmin.from('payments').insert(payload);

      if (!error) return true;
      // Already recorded (unique transaction hash).
      if (error.code === '23505') return true;

      const message = error.message || '';

      // Column does not exist in this database.
      const missing = message.match(/Could not find the '([^']+)' column/i)?.[1];
      if (missing && advance(missing)) {
        payload = build();
        continue;
      }

      // NOT NULL violation: the column exists but the row needs a value we
      // did not send, or the column is required.
      const notNull = message.match(/null value in column "([^"]+)"/i)?.[1];
      if (notNull) {
        const handled = roles.some((role) => {
          if (role.names.includes(notNull)) {
            if (role.names[0] === 'wallet') role.value = row.wallet;
            return advance(notNull);
          }
          return false;
        });
        if (handled) {
          payload = build();
          continue;
        }
      }

      // CHECK constraint on the status vocabulary.
      if (/violates check constraint/i.test(message) && advance('status')) {
        payload = build();
        continue;
      }
    } catch {
      /* try the next shape */
    }

    // Last resort: the bare minimum row.
    payload = { tx_hash: row.txHash, chain: row.chain, status: 'confirmed' };
  }

  console.warn('[payments/check] could not record the payment row');
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { chain, txHash, wallet, asset } = await req.json();

    if (!chain || !txHash || !wallet || !asset) {
      return NextResponse.json(
        { success: false, message: 'chain, txHash, wallet, and asset are required.' },
        { status: 400 }
      );
    }

    let valid = false;
    let from = wallet;
    let usdValue = 0;
    let tokenAmount = 0;
    let currency = 'USD';
    const toWallet = chain === 'base' ? BASE_TREASURY : TREASURY_SOLANA;

    if (chain === 'base') {
      if (isTokenAsset(asset)) {
        const token = asset === 'USDC' ? BASE_USDC : BASE_USDT;
        const decimals = asset === 'USDC' ? 6 : BASE_USDT_DECIMALS;
        if (!token) {
          return NextResponse.json(
            { success: false, message: `${asset} is not supported on Base.` }
          );
        }
        const result = await verifyBasePayment(txHash as `0x${string}`, token, decimals);
        valid = result.valid;
        if (result.from) from = result.from;
        if (valid) {
          tokenAmount = Number(result.amount ?? 0) / 10 ** decimals;
          usdValue = tokenAmount;
          currency = asset;
        }
      } else {
        try {
          const receipt = await baseClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
          if (receipt.status === 'success') {
            const tx = await baseClient.getTransaction({ hash: txHash as `0x${string}` });
            if (tx.to?.toLowerCase() === BASE_TREASURY.toLowerCase() && tx.value > 0n) {
              valid = true;
              from = tx.from;
              const ethAmount = Number(tx.value) / 1e18;
              const price = await getUsdPrice('ethereum');
              tokenAmount = ethAmount;
              usdValue = ethAmount * price;
              currency = 'ETH';
            }
          }
        } catch {
          /* ignore */
        }
      }
    } else {
      const rpc =
        chain === 'solana-devnet' ? SOLANA_DEVNET_RPC : SOLANA_MAINNET_RPC;
      const conn = new Connection(rpc, 'confirmed');

      try {
        const tx = await conn.getParsedTransaction(txHash, {
          maxSupportedTransactionVersion: 0,
        });

        if (tx && !tx.meta?.err && tx.meta) {
          const accountKeys = tx.transaction.message.accountKeys;
          const treasury = new PublicKey(TREASURY_SOLANA);
          const treasuryIdx = accountKeys.findIndex((k) => k.pubkey.equals(treasury));
          // The fee payer is the first account and is the wallet that paid.
          from = accountKeys[0].pubkey.toBase58();

          if (isTokenAsset(asset)) {
            // A token payment moves tokens, not lamports, so the treasury's
            // SOL balance does not change. Read the treasury token account
            // balance delta instead.
            const candidateMints = TOKEN_MINTS[`${chain}:${asset}`] ?? [];

            for (const mintAddress of candidateMints) {
              try {
                const usdcMint = new PublicKey(mintAddress);
                const treasuryAta = await getAssociatedTokenAddress(usdcMint, treasury);
                const ataIdx = accountKeys.findIndex((k) => k.pubkey.equals(treasuryAta));
                if (ataIdx < 0) continue;

                const readTokenBalance = (list: typeof tx.meta.preTokenBalances) =>
                  list?.find(
                    (b) => b.accountIndex === ataIdx && b.mint === mintAddress
                  )?.uiTokenAmount;

                const pre = readTokenBalance(tx.meta.preTokenBalances);
                const post = readTokenBalance(tx.meta.postTokenBalances);
                const decimals = post?.decimals ?? pre?.decimals ?? 6;
                const delta =
                  BigInt(post?.amount ?? '0') - BigInt(pre?.amount ?? '0');

                if (delta > 0n) {
                  tokenAmount = Number(delta) / 10 ** decimals;
                  usdValue = tokenAmount;
                  currency = asset;
                  if (usdValue >= UNLOCK_PRICE_USD) valid = true;
                  break;
                }
              } catch {
                /* try the next candidate mint */
              }
            }
          } else if (treasuryIdx >= 0) {
            // Native SOL: the treasury's lamport balance grows by the amount.
            const diff =
              tx.meta.postBalances[treasuryIdx] - tx.meta.preBalances[treasuryIdx];
            if (diff > 0) {
              const solAmount = diff / LAMPORTS_PER_SOL;
              const price = await getUsdPrice('solana');
              tokenAmount = solAmount;
              usdValue = solAmount * price;
              currency = 'SOL';
              if (usdValue >= UNLOCK_PRICE_USD) valid = true;
            }
          }
        }
      } catch {
        // An unknown or unparsable signature is a failed verification, not a
        // server error.
        valid = false;
      }
    }

    if (!valid) {
      return NextResponse.json({
        success: false,
        message: `Payment not found or below $${UNLOCK_PRICE_USD.toFixed(
          2
        )}. Wait a few seconds and retry.`,
      });
    }

    // Record the payment and grant a wallet-scoped entitlement. The service role
    // key bypasses RLS so a paid buyer is never locked out by a DB policy.
    await recordPayment({
      txHash,
      chain,
      wallet: from,
      toWallet,
      tokenAmount,
      currency,
      usdValue,
      paidAt: new Date().toISOString(),
    });

    try {
      await supabaseAdmin
        .from('entitlements')
        .upsert(
          {
            wallet: from,
            tier: 'all',
            source: 'payment',
            paid_at: new Date().toISOString(),
          },
          { onConflict: 'wallet' }
        );
    } catch (e) {
      console.warn('[payments/check] entitlement upsert threw:', e);
    }

    // The paying wallet is the key: it is stored in `payments` and in
    // `entitlements`, so the same wallet is never asked to pay again — on this
    // device or any other device that connects it.
    return NextResponse.json({
      success: true,
      message: 'Payment confirmed! Every lesson is unlocked on this wallet.',
      wallet: from,
      usdValue,
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
