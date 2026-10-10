import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Optional owner master code (unlimited). Only active when set in the env.
const OWNER_UNLOCK_CODE = (process.env.OWNER_UNLOCK_CODE || '').trim().toUpperCase();

/**
 * Codes that work even before Supabase is seeded. Usage is tracked in-memory
 * per server instance as a best-effort fallback so the built-in master code
 * still respects its max_uses when no database is configured.
 */
const BUILT_IN_CODES: Record<string, number> = {
  'JUDGES-SOLANA-2026': 100,
};
const builtInUsage = new Map<string, number>();

function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return url.length > 0 && !url.includes('your-project');
}

type RedeemResult =
  | { ok: true; remaining: number }
  | { ok: false; status: number; message: string };

async function redeemFromDb(code: string): Promise<RedeemResult> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('max_uses, used_count')
    .eq('code', code)
    .maybeSingle();

  if (error) {
    console.error('[invite/redeem] select failed:', { code: error.code, message: error.message, details: error.details, hint: error.hint });
    return { ok: false, status: 500, message: 'Could not reach the code service. Please try again.' };
  }
  if (!data) {
    return { ok: false, status: 400, message: 'Invalid invite code.' };
  }
  if (data.used_count >= data.max_uses) {
    return { ok: false, status: 409, message: 'This code has reached its usage limit.' };
  }

  // Optimistic conditional update guards against concurrent redemptions.
  const nextCount = data.used_count + 1;
  const { data: updated, error: updateError } = await supabase
    .from('invite_codes')
    .update({ used_count: nextCount })
    .eq('code', code)
    .eq('used_count', data.used_count)
    .select('used_count');

  if (updateError) {
    console.error('[invite/redeem] update failed:', { code: updateError.code, message: updateError.message, details: updateError.details, hint: updateError.hint });
    return { ok: false, status: 500, message: 'Could not redeem the code. Try again.' };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, status: 409, message: 'That code was just used up. Please try another.' };
  }

  return { ok: true, remaining: Math.max(data.max_uses - (data.used_count + 1), 0) };
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'Code is required.' }, { status: 400 });
    }

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return NextResponse.json({ success: false, message: 'Code is required.' }, { status: 400 });
    }

    // Owner master code — unlimited, only active when configured via env.
    if (OWNER_UNLOCK_CODE && normalized === OWNER_UNLOCK_CODE) {
      return NextResponse.json({ success: true, tier: 'all' });
    }

    // Preferred path: enforce max_uses / used_count against Supabase.
    if (supabaseConfigured()) {
      const result = await redeemFromDb(normalized);
      if (result.ok) {
        return NextResponse.json({ success: true, tier: 'all', remainingUses: result.remaining });
      }
      return NextResponse.json({ success: false, message: result.message }, { status: result.status });
    }

    // Fallback: built-in codes with in-memory usage limits.
    const max = BUILT_IN_CODES[normalized];
    if (max === undefined) {
      return NextResponse.json({ success: false, message: 'Invalid invite code.' }, { status: 400 });
    }

    const used = builtInUsage.get(normalized) ?? 0;
    if (used >= max) {
      return NextResponse.json({ success: false, message: 'This code has reached its usage limit.' }, { status: 409 });
    }
    builtInUsage.set(normalized, used + 1);

    return NextResponse.json({
      success: true,
      tier: 'all',
      remainingUses: Math.max(max - (used + 1), 0),
    });
  } catch (e) {
    console.error('[invite/redeem] unexpected error:', e);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
