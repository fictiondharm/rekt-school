'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getLesson } from '@/lib/content';
import { TopBar } from '@/components/layout/TopBar';
import { CourseSidebar } from '@/components/layout/CourseSidebar';
import { LessonEngine } from '@/components/lesson-engine/LessonEngine';
import { B1PracticeCompanion } from '@/components/lesson-engine/B1PracticeCompanion';
import { B2Companion } from '@/components/lesson-engine/companions/B2Companion';
import { B3Companion } from '@/components/lesson-engine/companions/B3Companion';
import { B4Companion } from '@/components/lesson-engine/companions/B4Companion';
import { B5Companion } from '@/components/lesson-engine/companions/B5Companion';
import { B6Companion } from '@/components/lesson-engine/companions/B6Companion';
import { B7Companion } from '@/components/lesson-engine/companions/B7Companion';
import { B8Companion } from '@/components/lesson-engine/companions/B8Companion';
import { B9Companion } from '@/components/lesson-engine/companions/B9Companion';
import { B10Companion } from '@/components/lesson-engine/companions/B10Companion';
import { LiquidityLab } from '@/components/simulators/LiquidityLab';
import { MoneyMarketLab } from '@/components/simulators/MoneyMarketLab';
import { LiquidationLab } from '@/components/simulators/LiquidationLab';
import { I2Companion } from '@/components/lesson-engine/companions/I2Companion';
import { I3Companion } from '@/components/lesson-engine/companions/I3Companion';
import { I4Companion } from '@/components/lesson-engine/companions/I4Companion';
import { I5Companion } from '@/components/lesson-engine/companions/I5Companion';
import { I8Companion } from '@/components/lesson-engine/companions/I8Companion';
import { I9Companion } from '@/components/lesson-engine/companions/I9Companion';
import { I10Companion } from '@/components/lesson-engine/companions/I10Companion';
import { I11Companion } from '@/components/lesson-engine/companions/I11Companion';
import { I12Companion } from '@/components/lesson-engine/companions/I12Companion';
import { I13Companion } from '@/components/lesson-engine/companions/I13Companion';
import { I14Companion } from '@/components/lesson-engine/companions/I14Companion';
import { TaskCard, FaucetWidget, PaymentModal } from '@/components/onchain';
import { canAccess, isAccessGateEnabled } from '@/lib/access';
import { getLocalAura } from '@/lib/progress';
import { Button, Card, Badge } from '@/components/ui';
import { Lock, KeyRound, CheckCircle2, ArrowLeft, Lightbulb, Coins } from 'lucide-react';

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default function DynamicLessonPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.lessonId.toUpperCase();
  const lesson = getLesson(lessonId);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aura, setAura] = useState(0);
  const [hasUnlockedAll, setHasUnlockedAll] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  useEffect(() => {
    setAura(getLocalAura());
    const checkUnlock = () => {
      const unlocked =
        localStorage.getItem('defi_maxi_unlocked_all') === 'true' ||
        localStorage.getItem('defi_mommy_unlocked_all') === 'true' ||
        localStorage.getItem('defi_quest_unlocked_all') === 'true';
      if (unlocked) setHasUnlockedAll(true);
    };
    checkUnlock();
    window.addEventListener('storage', checkUnlock);
    return () => window.removeEventListener('storage', checkUnlock);
  }, []);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-8 space-y-4">
        <h2 className="text-2xl font-heading font-bold text-ink">Lesson Not Found</h2>
        <p className="text-ink-soft text-sm">Lesson "{lessonId}" could not be found.</p>
        <Link href="/">
          <Button variant="primary">Return to Home</Button>
        </Link>
      </div>
    );
  }

  // Access check
  const access = canAccess(
    hasUnlockedAll ? { hasRedeemedCode: true } : null,
    { id: lesson.id, freePreview: lesson.freePreview }
  );

  const handleRedeemInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    setRedeemLoading(true);
    setRedeemError(null);

    try {
      const res = await fetch('/api/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteInput.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setHasUnlockedAll(true);
        localStorage.setItem('defi_maxi_unlocked_all', 'true');
        window.dispatchEvent(new Event('storage'));
      } else {
        setRedeemError(data.message || 'Invalid invite code.');
      }
    } catch {
      setRedeemError('Network error verifying invite code.');
    } finally {
      setRedeemLoading(false);
    }
  };

  // Practice companion selector
  const getCompanion = () => {
    switch (lesson.id) {
      case 'B1':
        return <B1PracticeCompanion />;
      case 'B2':
        return (
          <div className="w-full max-w-lg space-y-6">
            <B2Companion />
            <TaskCard taskId="connect_wallet" onVerified={(awarded) => setAura((prev) => prev + awarded)} />
          </div>
        );
      case 'B3':
        return <B3Companion />;
      case 'B4':
        return (
          <div className="w-full max-w-lg space-y-6">
            <B4Companion />
            <FaucetWidget />
            <TaskCard taskId="claim_gas" onVerified={(awarded) => setAura((prev) => prev + awarded)} />
          </div>
        );
      case 'B5':
        return (
          <div className="w-full max-w-lg space-y-6">
            <B5Companion />
            <FaucetWidget />
            <TaskCard taskId="claim_fusdc" onVerified={(awarded) => setAura((prev) => prev + awarded)} />
          </div>
        );
      case 'B6':
        return (
          <div className="w-full max-w-lg space-y-6">
            <B6Companion />
            <TaskCard taskId="mint_token" onVerified={(awarded) => setAura((prev) => prev + awarded)} />
          </div>
        );
      case 'B7':
        return (
          <div className="w-full max-w-lg space-y-6">
            <B7Companion />
            <TaskCard taskId="swap_in_course_pool" onVerified={(awarded) => setAura((prev) => prev + awarded)} />
          </div>
        );
      case 'B8':
        return <B8Companion />;
      case 'B9':
        return <B9Companion />;
      case 'B10':
        return <B10Companion />;
      case 'I1':
        return <LiquidityLab />;
      case 'I2':
        return <I2Companion />;
      case 'I3':
        return <I3Companion />;
      case 'I4':
        return <I4Companion />;
      case 'I5':
        return <I5Companion />;
      case 'I6':
        return <MoneyMarketLab />;
      case 'I7':
        return <LiquidationLab />;
      case 'I8':
        return <I8Companion />;
      case 'I9':
        return <I9Companion />;
      case 'I10':
        return <I10Companion />;
      case 'I11':
        return <I11Companion />;
      case 'I12':
        return <I12Companion />;
      case 'I13':
        return <I13Companion />;
      case 'I14':
        return <I14Companion />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <TopBar
        lessonTitle={`${lesson.id}: ${lesson.title}`}
        aura={aura}
        streak={1}
        showTourButton={lesson.id === 'B1'}
      />

      <div className="flex-1 flex min-h-0">
        <CourseSidebar
          currentLessonId={lesson.id}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* If locked, render Lock Wall */}
        {!access.allowed ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-surface/30">
            <Card className="max-w-md w-full p-8 space-y-6 border-2 border-ink shadow-pop-lg">
              <div className="w-16 h-16 rounded-full bg-tertiary/30 border-2 border-ink flex items-center justify-center text-amber-700">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <Badge variant="warn" className="text-xs">
                  PAID ACCESS REQUIRED
                </Badge>
                <h3 className="font-heading font-bold text-2xl text-ink">
                  {lesson.id}: {lesson.title}
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  This lesson is part of the full curriculum. Redeem your hackathon invite code or unlock for $1 USDC to continue.
                </p>
              </div>

              {/* Inline Redeem Form */}
              <form onSubmit={handleRedeemInline} className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter code (e.g. JUDGES or JUDGES-SOLANA-2026)"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  className="w-full p-3 text-xs font-mono uppercase bg-bg rounded-lg border-2 border-ink focus:ring-2 focus:ring-accent focus:outline-none"
                />

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={redeemLoading}
                  className="w-full gap-2 text-xs"
                >
                  <KeyRound className="w-4 h-4" /> Unlock All Lessons
                </Button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-ink-soft uppercase font-bold">or</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <Button
                  type="button"
                  variant="accent"
                  onClick={() => setPaymentModalOpen(true)}
                  className="w-full gap-2 text-xs"
                >
                  <Coins className="w-4 h-4" /> Unlock Course for $1 USDC
                </Button>
              </form>

              {redeemError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-900 border-2 border-red-300 text-xs">
                  {redeemError}
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <Link
                  href="/learn/b1"
                  className="text-accent hover:underline flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Free B1
                </Link>
                <Link
                  href="/learn/i1"
                  className="text-accent hover:underline flex items-center gap-1 font-semibold"
                >
                  Try Free Liquidity Lab <Lightbulb className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          <LessonEngine
            lesson={lesson}
            practiceSlot={getCompanion()}
            onAuraChange={(delta) => setAura((prev) => prev + delta)}
          />
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={() => {
          setHasUnlockedAll(true);
          localStorage.setItem('defi_maxi_unlocked_all', 'true');
          window.dispatchEvent(new Event('storage'));
        }}
      />
    </div>
  );
}
