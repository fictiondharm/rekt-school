/**
 * User progress storage interface.
 * Operates in LocalStorage for offline/demo and syncs with Supabase in Day 3.
 * Aura: earned by acing quiz questions (+), lost by answering wrong (-).
 */

export interface LessonProgressState {
  currentStepIndex: number;
  completedStepIds: string[];
  isCompleted: boolean;
  quizScores: Record<string, number>;
  aura: number;
}

const STORAGE_PREFIX = 'defi_maxi_';
const LEGACY_PREFIX = 'defi_quest_';

export function getLocalAura(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(`${STORAGE_PREFIX}aura`) || localStorage.getItem(`${LEGACY_PREFIX}xp`);
  return raw ? parseInt(raw, 10) : 0;
}

export function addLocalAura(amount: number): number {
  if (typeof window === 'undefined') return 0;
  const current = getLocalAura();
  const next = current + amount;
  localStorage.setItem(`${STORAGE_PREFIX}aura`, next.toString());
  return next;
}

export function hasAuraRewardBeenClaimed(rewardKey: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${STORAGE_PREFIX}aura_reward_${rewardKey}`) === '1';
}

export function claimAuraReward(rewardKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}aura_reward_${rewardKey}`, '1');
}

export function getLocalLessonProgress(lessonId: string): LessonProgressState {
  if (typeof window === 'undefined') {
    return {
      currentStepIndex: 0,
      completedStepIds: [],
      isCompleted: false,
      quizScores: {},
      aura: 0,
    };
  }

  const raw =
    localStorage.getItem(`${STORAGE_PREFIX}lesson_${lessonId}`) ||
    localStorage.getItem(`${LEGACY_PREFIX}lesson_${lessonId}`);
  if (!raw) {
    return {
      currentStepIndex: 0,
      completedStepIds: [],
      isCompleted: false,
      quizScores: {},
      aura: 0,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.aura === 'number') return parsed;
    return {
      ...parsed,
      aura: parsed.xp || 0,
    };
  } catch {
    return {
      currentStepIndex: 0,
      completedStepIds: [],
      isCompleted: false,
      quizScores: {},
      aura: 0,
    };
  }
}

export function saveLocalLessonProgress(
  lessonId: string,
  state: Partial<LessonProgressState>
): LessonProgressState {
  if (typeof window === 'undefined') {
    return {
      currentStepIndex: 0,
      completedStepIds: [],
      isCompleted: false,
      quizScores: {},
      aura: 0,
      ...state,
    };
  }

  const existing = getLocalLessonProgress(lessonId);
  const updated: LessonProgressState = {
    ...existing,
    ...state,
    completedStepIds: Array.from(
      new Set([...existing.completedStepIds, ...(state.completedStepIds || [])])
    ),
  };

  localStorage.setItem(`${STORAGE_PREFIX}lesson_${lessonId}`, JSON.stringify(updated));
  return updated;
}