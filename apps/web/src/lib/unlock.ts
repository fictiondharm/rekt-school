'use client';

/**
 * The single, canonical client-side unlock flag.
 *
 * It is written after a verified on-chain payment or a redeemed invite code
 * and read by the course sidebar and the lesson paywall. Legacy keys
 * (defi_maxi_unlocked_all, defi_mommy_unlocked_all, defi_quest_unlocked_all)
 * are no longer read anywhere.
 */
export const UNLOCK_STORAGE_KEY = 'rekt_school_unlocked';

/** True when this browser has unlocked the full course. */
export function hasUnlockedCourse(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(UNLOCK_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Marks this browser as unlocked and notifies open components. */
export function setCourseUnlocked(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
  } catch {
    // Storage can be unavailable (private mode); the UI simply stays locked.
  }
  window.dispatchEvent(new Event('storage'));
}
