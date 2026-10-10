import { describe, it, expect } from 'vitest';

describe('Access Control Rules (06-HACKATHON-OVERRIDE)', () => {
  function canAccessMock(
    gateEnabled: boolean,
    user: { hasRedeemedCode?: boolean; hasPaid?: boolean } | null,
    lesson: { id: string; freePreview?: boolean }
  ) {
    if (!gateEnabled) return { allowed: true };
    if (lesson.freePreview || lesson.id === 'B1' || lesson.id === 'I1') {
      return { allowed: true };
    }
    if (user?.hasRedeemedCode || user?.hasPaid) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Requires invite code or payment' };
  }

  it('allows access to all lessons when gate is disabled (Days 1-8 default)', () => {
    const result = canAccessMock(false, null, { id: 'B4', freePreview: false });
    expect(result.allowed).toBe(true);
  });

  it('always allows free previews (B1 and I1) even when gate is enabled and user has no payment', () => {
    const b1Result = canAccessMock(true, null, { id: 'B1', freePreview: true });
    expect(b1Result.allowed).toBe(true);

    const i1Result = canAccessMock(true, null, { id: 'I1', freePreview: true });
    expect(i1Result.allowed).toBe(true);
  });

  it('locks paid lessons when gate is enabled for unauthenticated / unpaid users', () => {
    const result = canAccessMock(true, null, { id: 'B6', freePreview: false });
    expect(result.allowed).toBe(false);
  });

  it('unlocks paid lessons once user redeems an invite code or pays', () => {
    const codeUser = { hasRedeemedCode: true };
    const result = canAccessMock(true, codeUser, { id: 'B6', freePreview: false });
    expect(result.allowed).toBe(true);

    const paidUser = { hasPaid: true };
    const paidResult = canAccessMock(true, paidUser, { id: 'B7', freePreview: false });
    expect(paidResult.allowed).toBe(true);
  });
});
