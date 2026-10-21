import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase } from '@/lib/supabase';
import { verifyBasePayment, BASE_TREASURY } from '@/lib/base';
import { baseClient } from '@/lib/base';
import { UNLOCK_PRICE_USD, UNLOCK_USDC_BASE_UNITS } from '@/lib/pricing';

const SOLANA_MAINNET_RPC = process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';
const SOLANA_DEVNET_RPC = process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';

const TREASURY_SOLANA = 'HtKPeixUAG5a28rxn4weDqyNfwb8BwSmEp7y7xfZHTf5';

async function getUsdPrice(id: string): Promise<number> {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`, { next: { revalidate: 60 } });
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
      return NextResponse.json({ success: false, message: 'chain, txHash, wallet, and asset are required.' }, { status: 400 });
    }

    let valid = false;
    let from = wallet;
    let usdValue = 0;

    if (chain === 'base') {
      if (asset === 'USDC') {
        const result = await verifyBasePayment(txHash as `0x${string}`);
        valid = result.valid;
        if (result.from) from = result.from;
        if (valid) usdValue = UNLOCK_PRICE_USD;
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
              usdValue = ethAmount * price;
            }
          }
        } catch { /* ignore */ }
      }
    } else {
      const rpc = chain === 'solana-devnet'
    ? (process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com')
    : (process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com');
      const conn = new Connection(rpc, 'confirmed');
      const tx = await conn.getParsedTransaction(txHash, { maxSupportedTransactionVersion: 0 });

      if (tx && !tx.meta?.err && tx.meta) {
        const accountKeys = tx.transaction.message.accountKeys;
        const treasuryIdx = accountKeys.findIndex(k => k.pubkey.toBase58() === TREASURY_SOLANA);
        if (treasuryIdx >= 0) {
          const diff = tx.meta.postBalances[treasuryIdx] - tx.meta.preBalances[treasuryIdx];
          if (diff > 0) {
            if (asset === 'USDC') {
              if (diff >= UNLOCK_USDC_BASE_UNITS) {
                valid = true;
                from = accountKeys[0].pubkey.toBase58();
                usdValue = diff / 1_000_000;
              }
            } else {
              const solAmount = diff / LAMPORTS_PER_SOL;
              const price = await getUsdPrice('solana');
              usdValue = solAmount * price;
              if (usdValue >= UNLOCK_PRICE_USD) {
                valid = true;
                from = accountKeys[0].pubkey.toBase58();
              }
            }
          }
        }
      }
    }

    if (!valid) {
      return NextResponse.json({ success: false, message: `Payment not found or below $${UNLOCK_PRICE_USD.toFixed(2)}. Wait a few seconds and retry.` });
    }

    if (usdValue < UNLOCK_PRICE_USD) {
      return NextResponse.json({ success: false, message: `Payment worth $${usdValue.toFixed(2)}. Must be at least $${UNLOCK_PRICE_USD.toFixed(2)}.` });
    }

    // Record the payment best-effort. A DB hiccup must not block the user from
    // receiving their unlock code once the payment is verified on-chain.
    try {
      const { error } = await supabase.from('payments').insert({
        reference: txHash,
        signature: txHash,
        payer_wallet: from,
        amount_usdc: UNLOCK_PRICE_USD,
        status: 'paid',
        paid_at: new Date().toISOString(),
      });
      if (error && error.code !== '23505') {
        console.warn('[payments/check] payment insert failed:', error.message);
      }
    } catch (e) {
      console.warn('[payments/check] payment insert threw:', e);
    }

    // Every paid unlock mints a single-use code accepted by /api/invite/redeem.
    const code = `REKT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    try {
      await supabase.from('invite_codes').insert({ code, max_uses: 1, used_count: 0 });
    } catch (e) {
      console.warn('[payments/check] invite code insert threw:', e);
    }

    return NextResponse.json({ success: true, message: 'Payment confirmed! Use this code to unlock all courses.', code });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
