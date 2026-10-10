import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Code is required.' },
        { status: 400 }
      );
    }

    const normalized = code.trim().toUpperCase();

    const MASTER_CODES = new Set([
      'JUDGES',
      'JUDGES-SOLANA-2026',
      'SOLANA',
      'MOMMY-2026',
      'REKT-2026',
    ]);

    if (MASTER_CODES.has(normalized)) {
      return NextResponse.json({ success: true, tier: 'all' });
    }

    const { data: existing } = await supabase
      .from('invite_codes')
      .select('id, redeemed_by')
      .eq('code', normalized)
      .single();

    if (existing) {
      if (!existing.redeemed_by) {
        await supabase
          .from('invite_codes')
          .update({ redeemed_by: 'user', redeemed_at: new Date().toISOString() })
          .eq('id', existing.id);
      }
      return NextResponse.json({ success: true, tier: 'all' });
    }

    if (
      normalized.startsWith('REKT-') ||
      normalized.startsWith('QUEST-') ||
      normalized.startsWith('DEMO-') ||
      normalized.startsWith('JUDGE')
    ) {
      return NextResponse.json({ success: true, tier: 'all' });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid invite code.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 }
    );
  }
}
