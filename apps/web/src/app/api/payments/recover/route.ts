import { NextRequest, NextResponse } from 'next/server';
import { BASE_TREASURY, findRecentBasePayment } from '@/lib/base';
import { grantEntitlement, recordPayment } from '@/lib/payments';

/**
 * Restores access for a wallet that already paid but never got unlocked —
 * the transaction confirmed on-chain while the browser tab was closed, the
 * request timed out, or the database was unreachable at that moment.
 *
 * Read-only against the chain: it scans the treasury's recent USDC transfers
 * for one from this wallet, then records it exactly like a normal payment.
 */
export async function POST(req: NextRequest) {
  try {
    const { chain, wallet } = await req.json();

    if (!wallet || typeof wallet !== 'string') {
      return NextResponse.json(
        { success: false, message: 'wallet is required.' },
        { status: 400 }
      );
    }

    if (chain !== 'base') {
      return NextResponse.json(
        { success: false, message: 'Recovery is only available for Base payments.' },
        { status: 400 }
      );
    }

    const found = await findRecentBasePayment(wallet as `0x${string}`);
    if (!found) {
      return NextResponse.json({
        success: false,
        message:
          'No recent Base USDC payment from this wallet. If you just paid, wait a minute and try again.',
      });
    }

    const usdValue = Number(found.amount) / 1_000_000;

    await recordPayment({
      txHash: found.txHash,
      chain,
      wallet,
      toWallet: BASE_TREASURY,
      tokenAmount: usdValue,
      currency: 'USDC',
      usdValue,
      paidAt: new Date().toISOString(),
    });

    await grantEntitlement(wallet);

    return NextResponse.json({
      success: true,
      message: 'Payment found. Every lesson is unlocked on this wallet.',
      txHash: found.txHash,
      usdValue,
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
