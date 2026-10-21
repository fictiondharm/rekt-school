import { Lesson } from '@defi-mommy/content-schema';
import { supabase } from '@/lib/supabase';
import { UNLOCK_PRICE_USD } from '@/lib/pricing';

export interface UserAccessProfile {
  userId?: string;
  hasRedeemedCode?: boolean;
  hasPaid?: boolean;
  isManualUnlocked?: boolean;
}

/**
 * The access gate is ON by default: every lesson except the free previews
 * (B1, I1 and P5) is locked behind a paid unlock or an invite code.
 *
 * There is no client-side bypass. The only way to open the gate is an explicit
 * environment override, and that override is ignored in production builds so a
 * stray env var can never unlock paid content for real visitors.
 */
export function isAccessGateEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return true;

  const envToggle =
    process.env.NEXT_PUBLIC_ACCESS_GATE_ENABLED ?? process.env.ACCESS_GATE_ENABLED;
  return envToggle !== 'false';
}

export function canAccess(
  user: UserAccessProfile | null,
  lesson: { id: string; freePreview?: boolean }
): { allowed: boolean; reason?: string } {
  if (!isAccessGateEnabled()) {
    return { allowed: true };
  }

  if (lesson.freePreview || lesson.id === 'B1' || lesson.id === 'I1' || lesson.id === 'P5') {
    return { allowed: true };
  }

  if (user?.hasRedeemedCode || user?.hasPaid || user?.isManualUnlocked) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `This lesson requires an invite code or a $${UNLOCK_PRICE_USD.toFixed(2)} unlock to access.`,
  };
}

export async function checkPaymentByWallet(wallet: string): Promise<boolean> {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('payer_wallet', wallet)
    .eq('status', 'paid')
    .limit(1);
  return (data?.length ?? 0) > 0;
}
