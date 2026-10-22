import { NextRequest, NextResponse } from 'next/server';
import { grantEntitlement, hasPaidAccess } from '@/lib/payments';
import { resolveLinkedWallets } from '@/lib/walletLinks';

/**
 * Wallet-scoped access check.
 *
 * A buyer who paid with a wallet keeps access on every device that connects
 * the same wallet, even if the local unlock flag was cleared. Linked wallets
 * are followed too, so a payment made from a Base (EVM) account also unlocks
 * the Solana account the same person connects with.
 */
export async function GET(req: NextRequest) {
  try {
    const wallet = (req.nextUrl.searchParams.get('wallet') || '').trim();
    if (!wallet) {
      return NextResponse.json(
        { success: false, unlocked: false, message: 'wallet is required.' },
        { status: 400 }
      );
    }

    const direct = await hasPaidAccess(wallet);

    if (direct === 'unreachable') {
      return NextResponse.json({
        success: false,
        unlocked: false,
        message: 'Database unreachable.',
      });
    }

    if (direct) {
      return NextResponse.json({
        success: true,
        unlocked: true,
        tier: 'all',
        source: 'payment',
      });
    }

    // The wallet itself never paid, but an address proven to belong to the
    // same person did. Re-grant so the local row exists for future checks.
    for (const linked of await resolveLinkedWallets(wallet)) {
      const linkedPaid = await hasPaidAccess(linked);
      if (linkedPaid === true) {
        await grantEntitlement(wallet);
        return NextResponse.json({
          success: true,
          unlocked: true,
          tier: 'all',
          source: 'linked-wallet',
        });
      }
    }

    return NextResponse.json({
      success: true,
      unlocked: false,
      tier: null,
      source: null,
    });
  } catch {
    return NextResponse.json(
      { success: false, unlocked: false, message: 'Server error.' },
      { status: 500 }
    );
  }
}
