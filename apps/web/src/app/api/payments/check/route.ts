import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { verifyBasePayment, BASE_TREASURY } from '@/lib/base';
import { baseClient } from '@/lib/base';
import { grantEntitlement, recordPayment } from '@/lib/payments';
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
      if (asset === 'USDC') {
        const result = await verifyBasePayment(txHash as `0x${string}`);
        valid = result.valid;
        if (result.from) from = result.from;
        if (valid) {
          tokenAmount = Number(result.amount ?? 0) / 1_000_000;
          usdValue = tokenAmount;
          currency = 'USDC';
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
      await grantEntitlement(from);
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
