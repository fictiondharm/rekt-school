import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Wallet-scoped access check.
 *
 * A buyer who paid with a wallet keeps access on every device that connects
 * the same wallet, even if the local unlock flag was cleared.
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

    const { data: entitlement, error: entitlementError } = await supabaseAdmin
      .from('entitlements')
      .select('tier, source')
      .eq('wallet', wallet)
      .maybeSingle();

    if (entitlementError) {
      console.warn('[access/check] entitlement lookup failed:', entitlementError.message);
      // The database is unreachable: do not burn the request budget on the
      // fallback queries.
      if (/fetch failed|timeout|abort/i.test(entitlementError.message)) {
        return NextResponse.json({ success: false, unlocked: false, message: 'Database unreachable.' });
      }
    }
    if (entitlement) {
      return NextResponse.json({
        success: true,
        unlocked: true,
        tier: entitlement.tier || 'all',
        source: entitlement.source || 'payment',
      });
    }

    // Fallback for databases where the entitlement row is missing: look for a
    // recorded payment. The status vocabulary and the wallet column name
    // differ between databases, so both are tried.
    const paidStatuses = ['confirmed', 'paid', 'completed'];
    const walletColumns = ['from_wallet', 'payer_wallet', 'wallet'];
    let paidRows = 0;

    for (const column of walletColumns) {
      try {
        const { data, error } = await supabaseAdmin
          .from('payments')
          .select('id')
          .eq(column, wallet)
          .in('status', paidStatuses)
          .limit(1);

        if (error) {
          if (/fetch failed|timeout|abort/i.test(error.message)) break;
          continue;
        }

        paidRows = data?.length ?? 0;
        if (paidRows > 0) break;
      } catch {
        /* try the next column name */
      }
    }

    const unlocked = paidRows > 0;

    return NextResponse.json({
      success: true,
      unlocked,
      tier: unlocked ? 'all' : null,
      source: unlocked ? 'payment' : null,
    });
  } catch {
    return NextResponse.json(
      { success: false, unlocked: false, message: 'Server error.' },
      { status: 500 }
    );
  }
}
