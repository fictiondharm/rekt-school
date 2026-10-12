'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lesson, Step, TourStepDefSchema } from '@defi-mommy/content-schema';
import { Button, Card, Disclaimer, Badge } from '@/components/ui';
import { ReadStep } from './ReadStep';
import { QuizView } from './QuizView';
import { UnderTheHood } from './UnderTheHood';
import { ExploreView } from './ExploreView';
import { CaseView } from './CaseView';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { TourWrapper } from '../tour/TourWrapper';
import { getMaxiAdvice } from '@/lib/maxi-advisor';
import { getNetworkMetaByLesson } from '@/lib/tier';
import {
  getLocalLessonProgress,
  saveLocalLessonProgress,
  getLocalAura,
} from '@/lib/progress';
import {
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Target,
  Trophy,
} from 'lucide-react';

export interface LessonEngineProps {
  lesson: Lesson;
  practiceSlot?: React.ReactNode;
  onAuraChange?: (delta: number) => void;
}

export function LessonEngine({
  lesson,
  practiceSlot,
  onAuraChange,
}: LessonEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);
  const [mobileTab, setMobileTab] = useState<'learn' | 'practice'>('learn');
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const net = getNetworkMetaByLesson(lesson.id);

  // Load saved progress
  useEffect(() => {
    const saved = getLocalLessonProgress(lesson.id);
    if (saved.completedStepIds.length > 0) {
      setCompletedStepIds(saved.completedStepIds);
      if (saved.currentStepIndex < lesson.steps.length) {
        setCurrentStepIndex(saved.currentStepIndex);
      }
      setLessonCompleted(saved.isCompleted);
    }
  }, [lesson.id, lesson.steps.length]);

  const currentStep: Step = lesson.steps[currentStepIndex] || lesson.steps[0];
  const isStepCompleted = completedStepIds.includes(currentStep.id);

  // Check if user is allowed to proceed to next step
  const canProceed = () => {
    if (
      currentStep.type === 'read' ||
      currentStep.type === 'deepdive' ||
      currentStep.type === 'reveal' ||
      currentStep.type === 'explore' ||
      currentStep.type === 'simulator' ||
      currentStep.type === 'case'
    ) {
      return true;
    }
    return isStepCompleted;
  };

  const getDisabledReason = () => {
    if (canProceed()) return null;
    if (currentStep.type === 'tour') return 'Complete or skip the spotlight tour to continue';
    if (currentStep.type === 'quiz') return 'Pass the quiz to unlock the next step';
    if (currentStep.type === 'onchain') return 'Complete the on-chain task to continue';
    return 'Complete the step requirement to proceed';
  };

  const markStepComplete = (stepId: string) => {
    if (!completedStepIds.includes(stepId)) {
      const nextCompleted = [...completedStepIds, stepId];
      setCompletedStepIds(nextCompleted);
      const isLastStep = currentStepIndex === lesson.steps.length - 1;
      const isAllComplete = isLastStep || nextCompleted.length === lesson.steps.length;

      if (isAllComplete) {
        setLessonCompleted(true);
      }

      // Aura is awarded only by the quiz itself (not per step)
      saveLocalLessonProgress(lesson.id, {
        currentStepIndex,
        completedStepIds: nextCompleted,
        isCompleted: isAllComplete,
        aura: getLocalAura(),
      });
    }
  };

  const handleNext = () => {
    markStepComplete(currentStep.id);
    if (currentStepIndex < lesson.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setActiveHintIndex(0);
      saveLocalLessonProgress(lesson.id, { currentStepIndex: nextIndex });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setActiveHintIndex(0);
      saveLocalLessonProgress(lesson.id, { currentStepIndex: prevIndex });
    }
  };

  // Launch tour if step is tour
  const launchTour = () => {
    setIsTourActive(true);
  };

  const onTourFinished = () => {
    setIsTourActive(false);
    markStepComplete(currentStep.id);
  };

  // Auto-launch tour when entering a tour step for first time
  useEffect(() => {
    if (currentStep.type === 'tour' && !completedStepIds.includes(currentStep.id)) {
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, currentStep, completedStepIds]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-border bg-surface sticky top-16 z-30">
        <button
          onClick={() => setMobileTab('learn')}
          className={`flex-1 py-3 text-xs font-semibold font-heading border-b-2 transition-colors ${
            mobileTab === 'learn'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-transparent text-ink-soft'
          }`}
        >
          1. Learn (Step {currentStepIndex + 1}/{lesson.steps.length})
        </button>
        <button
          onClick={() => setMobileTab('practice')}
          className={`flex-1 py-3 text-xs font-semibold font-heading border-b-2 transition-colors ${
            mobileTab === 'practice'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-transparent text-ink-soft'
          }`}
        >
          2. Practice Lab
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* LEARN PANEL (40% width on desktop) */}
        <div
          data-tour="learn-panel"
          className={`lg:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-y-auto border-r border-border bg-surface/50 ${
            mobileTab === 'practice' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="space-y-6">
            {/* Step Progress Dots */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                {lesson.steps.map((st, i) => {
                  const isCur = i === currentStepIndex;
                  const isDone = completedStepIds.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        if (isDone || i <= currentStepIndex) {
                          setCurrentStepIndex(i);
                        }
                      }}
                      className={`h-2.5 rounded-full transition-all ${
                        isCur
                          ? 'w-7 bg-accent'
                          : isDone
                          ? 'w-3 bg-accent'
                          : 'w-2 bg-border'
                      }`}
                      title={`Step ${i + 1}: ${st.title || st.type}`}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-mono font-semibold text-ink-soft">
                Step {currentStepIndex + 1} of {lesson.steps.length}
              </span>
            </div>

            {/* Step Title */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                {currentStep.type.toUpperCase()} STEP
              </span>
              <h2 className="text-2xl font-heading font-bold text-ink mt-1">
                {currentStep.title || lesson.title}
              </h2>
            </div>

            {/* Step Content by Type */}
            <div className="space-y-5">
              {currentStep.type === 'read' && <ReadStep body={currentStep.body} />}

              {currentStep.type === 'tour' && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft leading-relaxed">
                    Let's take a quick spotlight tour of the user interface. We will
                    highlight each essential area on your screen.
                  </p>
                  <Button
                    variant="primary"
                    onClick={launchTour}
                    className="gap-2 w-full"
                  >
                    <Play className="w-4 h-4 fill-white" /> Start Spotlight Tour
                  </Button>
                </div>
              )}

              {currentStep.type === 'reveal' && (
                <Card className="p-5 bg-accent/10 border-2 border-ink rounded-xl shadow-pop-lg space-y-3">
                  <div className="flex items-center gap-2 text-accent font-heading font-bold text-base">
                    <Lightbulb className="w-5 h-5" />
                    <span>{currentStep.title}</span>
                  </div>
                  <MarkdownText content={currentStep.body} className="text-sm" />
                </Card>
              )}

              {currentStep.type === 'deepdive' && (
                <UnderTheHood
                  title={currentStep.title}
                  body={currentStep.body}
                  defaultExpanded={true}
                />
              )}

              {currentStep.type === 'quiz' && (
                <QuizView
                  questions={currentStep.questions}
                  passScore={currentStep.passScore}
                  onPass={() => markStepComplete(currentStep.id)}
                  onAuraChange={onAuraChange}
                  auraRewardKey={`${lesson.id}-${currentStep.id}`}
                />
              )}

              {currentStep.type === 'explore' && (
                <ExploreView cardIds={currentStep.cardIds} />
              )}

              {currentStep.type === 'case' && (
                <CaseView caseId={currentStep.caseId} />
              )}

              {currentStep.type === 'simulator' && (
                <div className="space-y-4">
                  <p className="text-sm text-ink leading-relaxed">
                    Interactive simulation instructions: Use the controls in the
                    Practice panel on the right.
                  </p>
                  {currentStep.goal && (
                    <Card className="p-4 bg-accent/10 border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
                      <Target className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-emerald-900">
                          Optional Practice Challenge
                        </h4>
                        <p className="text-sm font-semibold text-emerald-950 mt-0.5">
                          {currentStep.goal.description}
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Maxi's Trench Hints & Advice */}
            {(() => {
              const stepHints = getMaxiAdvice(lesson.id, currentStep, currentStepIndex);
              const maxHints = stepHints.length;

              const toggleOrAdvanceHint = () => {
                if (activeHintIndex >= maxHints) {
                  setActiveHintIndex(0); // collapse if all shown
                } else {
                  setActiveHintIndex((prev) => Math.min(maxHints, prev + 1));
                }
              };

              return (
                <div data-tour="hint-button" className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleOrAdvanceHint}
                    className="gap-2 text-xs font-semibold hover:border-ink transition-all"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-tertiary" />
                    <span>
                      Tactical Hints ({activeHintIndex}/{maxHints})
                    </span>
                  </Button>
                  {activeHintIndex > 0 && (
                    <div className="mt-3 space-y-2.5 animate-in fade-in duration-200">
                      {stepHints.slice(0, activeHintIndex).map((hint: string, hIdx: number) => (
                        <div
                          key={hIdx}
                          className="p-3.5 rounded-xl bg-surface border-2 border-ink text-xs text-ink flex items-start gap-2.5 shadow-pop-sm"
                        >
                          <span className="px-2 py-0.5 rounded-md bg-tertiary text-ink border-2 border-ink font-bold text-[11px] shrink-0">
                            Pro Tip #{hIdx + 1}
                          </span>
                          <span className="leading-relaxed font-medium text-ink-soft">{hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Navigation Controls */}
          <div className="pt-8 border-t border-border mt-8 space-y-4">
            {getDisabledReason() && (
              <div className="text-xs text-ink-soft bg-tertiary/20 p-2.5 rounded-lg border-2 border-ink flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>{getDisabledReason()}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              {currentStepIndex < lesson.steps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-1.5 flex-1 max-w-[200px]"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-1.5 flex-1 max-w-[200px]"
                >
                  <CheckCircle2 className="w-4 h-4" /> Finish Lesson
                </Button>
              )}
            </div>

            {lessonCompleted && (
              <div className="p-5 rounded-xl bg-emerald-50 border-2 border-ink shadow-pop-lg text-emerald-900 space-y-3 animate-in fade-in">
                <Trophy className="w-8 h-8 text-accent" />
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-base">
                    Lesson {lesson.id} Completed!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Correct quiz answers earn Aura, wrong ones cost Aura. Your total is shown in the top bar.
                  </p>
                </div>

                {lesson.id.startsWith('B') ? (
                  parseInt(lesson.id.replace('B', ''), 10) < 10 ? (
                    <Link
                      href={`/learn/b${parseInt(lesson.id.replace('B', ''), 10) + 1}`}
                      className="block pt-1"
                    >
                      <Button variant="primary" className="w-full gap-2 text-xs font-bold">
                        Continue to Next Lesson (B{parseInt(lesson.id.replace('B', ''), 10) + 1}){' '}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/learn/i1" className="block pt-1">
                      <Button variant="accent" className="w-full gap-2 text-xs font-bold">
                        Start Intermediate (I1 Liquidity Lab) <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )
                ) : lesson.id.startsWith('I') ? (
                  parseInt(lesson.id.replace('I', ''), 10) < 10 ? (
                    <Link
                      href={`/learn/i${parseInt(lesson.id.replace('I', ''), 10) + 1}`}
                      className="block pt-1"
                    >
                      <Button variant="accent" className="w-full gap-2 text-xs font-bold">
                        Continue to Next Lab (I{parseInt(lesson.id.replace('I', ''), 10) + 1}){' '}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/labs" className="block pt-1">
                      <Button variant="accent" className="w-full gap-2 text-xs font-bold">
                        Explore the Labs Hub <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )
                ) : lesson.id.startsWith('P') ? (
                  parseInt(lesson.id.replace('P', ''), 10) < 12 ? (
                    <Link
                      href={`/learn/p${parseInt(lesson.id.replace('P', ''), 10) + 1}`}
                      className="block pt-1"
                    >
                      <Button variant="primary" className="w-full gap-2 text-xs font-bold">
                        Continue to Next Pro Module (P{parseInt(lesson.id.replace('P', ''), 10) + 1}){' '}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/pro" className="block pt-1">
                      <Button variant="accent" className="w-full gap-2 text-xs font-bold">
                        You finished the Pro tier - View the Pro Hub <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )
                ) : null}
              </div>
            )}

            <Disclaimer />
          </div>
        </div>

        {/* PRACTICE PANEL (60% width on desktop) */}
        <div
          data-tour="practice-panel"
          className={`lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-center overflow-y-auto bg-surface/30 ${
            mobileTab === 'learn' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
            <Badge variant={net.badgeVariant}>{net.badgeLabel}</Badge>
            <span className="text-[10px] font-mono text-ink-soft text-right">{net.clusterLine}</span>
          </div>
          {practiceSlot || (
            <Card className="max-w-md w-full p-8 space-y-5 border-2 border-dashed border-ink rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Lightbulb className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-lg text-ink">
                  Practice Lab
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Interactive simulators, liquidity curves, and on-chain verified
                  tasks appear right here as you progress through lessons.
                </p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border text-xs font-mono text-ink-soft">
                {net.clusterLine}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Driver.js Spotlight Tour Component */}
      {currentStep.type === 'tour' && (
        <TourWrapper
          steps={currentStep.steps}
          isActive={isTourActive}
          onComplete={onTourFinished}
        />
      )}
    </div>
  );
}
