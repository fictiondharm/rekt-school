import { Lesson } from '@defi-mommy/content-schema';
import { supabase } from '@/lib/supabase';

export interface UserAccessProfile {
  userId?: string;
  hasRedeemedCode?: boolean;
  hasPaid?: boolean;
  isManualUnlocked?: boolean;
}

export function isAccessGateEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const localToggle = localStorage.getItem('ACCESS_GATE_ENABLED');
    if (localToggle !== null) return localToggle === 'true';
  }
  return process.env.ACCESS_GATE_ENABLED === 'true' || process.env.NEXT_PUBLIC_ACCESS_GATE_ENABLED === 'true';
}

export function canAccess(
  user: UserAccessProfile | null,
  lesson: { id: string; freePreview?: boolean }
): { allowed: boolean; reason?: string } {
  if (!isAccessGateEnabled()) {
    return { allowed: true };
  }

  if (lesson.freePreview || lesson.id === 'B1' || lesson.id === 'I1') {
    return { allowed: true };
  }

  if (user?.hasRedeemedCode || user?.hasPaid || user?.isManualUnlocked) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'This lesson requires an invite code or $1 unlock to access.',
  };
}

export async function checkPaymentByWallet(wallet: string): Promise<boolean> {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('from_wallet', wallet)
    .eq('status', 'confirmed')
    .limit(1);
  return (data?.length ?? 0) > 0;
}
