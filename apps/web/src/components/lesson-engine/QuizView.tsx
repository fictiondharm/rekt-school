'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '@defi-mommy/content-schema';
import { Button, Card } from '@/components/ui';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { addLocalAura, claimAuraReward, hasAuraRewardBeenClaimed } from '@/lib/progress';

export interface QuizViewProps {
  questions: QuizQuestion[];
  passScore: number;
  onPass: (score: number) => void;
  onAuraChange?: (delta: number) => void;
  auraRewardKey?: string;
}

// Aura deltas per difficulty: correct / wrong
export const AURA_DELTAS: Record<string, { correct: number; wrong: number }> = {
  basic: { correct: 50, wrong: -25 },
  intermediate: { correct: 75, wrong: -40 },
  thinking: { correct: 120, wrong: -60 },
  default: { correct: 60, wrong: -30 },
};

export function getAuraDeltas(q: QuizQuestion) {
  return AURA_DELTAS[q.difficulty || 'default'];
}

const DIFFICULTY_BADGE: Record<string, string> = {
  basic: 'bg-quaternary/20 text-emerald-900 border-quaternary/40',
  intermediate: 'bg-tertiary/20 text-amber-900 border-tertiary/50',
  thinking: 'bg-danger/10 text-red-900 border-danger/30',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  thinking: 'Deep Think',
};

export function QuizView({
  questions,
  passScore,
  onPass,
  onAuraChange,
  auraRewardKey,
}: QuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) {
        score++;
      }
    });
    return score;
  };

  const currentScore = calculateScore();
  const isPassed = submitted && currentScore >= passScore;
  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  // Total aura delta for the current submitted attempt (for display)
  const attemptDelta = React.useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((sum, q) => {
      const deltas = getAuraDeltas(q);
      return selectedAnswers[q.id] === q.correct ? sum + deltas.correct : sum + deltas.wrong;
    }, 0);
  }, [submitted, questions, selectedAnswers]);

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();

    if (score >= passScore) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6D5EF5', '#14C38E', '#F5A524', '#EC4899', '#3B82F6'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
        });
      }, 200);

      onPass(score);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  // Apply aura once per step (on the first submit of this quiz step)
  React.useEffect(() => {
    if (!submitted) return;
    if (!auraRewardKey) return;
    if (hasAuraRewardBeenClaimed(auraRewardKey)) return;

    claimAuraReward(auraRewardKey);
    const next = addLocalAura(attemptDelta);
    if (onAuraChange) onAuraChange(attemptDelta);
  }, [submitted, attemptDelta, auraRewardKey, onAuraChange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="font-heading font-bold text-base text-ink">
          Lesson Quiz ({questions.length} questions)
        </h3>
        <span className="text-xs font-semibold text-ink-soft bg-surface border border-border px-2.5 py-1 rounded-full">
          Pass mark: {passScore} / {questions.length}
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const isCorrect = selected === q.correct;
          const deltas = getAuraDeltas(q);

          return (
            <Card key={q.id} className="p-5 space-y-4">
              <div className="font-heading font-semibold text-sm text-ink flex gap-2 flex-wrap items-start">
                <span className="text-primary font-bold">{idx + 1}.</span>
                <span className="min-w-0 flex-1">{q.prompt}</span>
                {q.difficulty && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${DIFFICULTY_BADGE[q.difficulty]}`}
                  >
                    {DIFFICULTY_LABEL[q.difficulty]}
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {q.options.map((option, optIdx) => {
                  const isOptSelected = selected === optIdx;
                  let optStyle =
                    'border-border hover:border-primary/50 hover:bg-primary-light/20 text-ink';

                  if (submitted) {
                    if (optIdx === q.correct) {
                      optStyle = 'border-accent bg-accent-light text-emerald-900 font-semibold';
                    } else if (isOptSelected && !isCorrect) {
                      optStyle = 'border-danger bg-danger-light text-red-900 line-through';
                    } else {
                      optStyle = 'border-border/60 opacity-60 text-ink-soft';
                    }
                  } else if (isOptSelected) {
                    optStyle = 'border-primary bg-primary-light text-primary font-semibold ring-1 ring-primary';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-button border text-sm transition-all flex items-start justify-between gap-3 ${optStyle}`}
                    >
                      <span>{option}</span>
                      {submitted && optIdx === q.correct && (
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      )}
                      {submitted && isOptSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    isCorrect ? 'bg-accent-light text-emerald-900' : 'bg-danger-light text-red-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">
                      {isCorrect ? 'Correct! ' : 'Not quite. '}
                      {isCorrect ? q.explainRight : q.explainWrong}
                    </span>
                    <span
                      className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                        isCorrect ? 'bg-emerald-600/10 text-emerald-800' : 'bg-red-600/10 text-red-800'
                      }`}
                    >
                      {isCorrect ? `+${deltas.correct}` : `${deltas.wrong}`} Aura
                    </span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="pt-2">
        {!submitted ? (
          <Button
            variant="primary"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="w-full"
          >
            Submit Quiz
          </Button>
        ) : (
          <div className="p-4 rounded-card bg-surface border border-border flex flex-col items-center justify-center space-y-3">
            {isPassed ? (
              <>
                <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center text-accent">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-ink">You passed!</h4>
                  <p className="text-xs text-ink-soft">
                    You scored {currentScore} / {questions.length}. Step completed!
                  </p>
                  {attemptDelta !== 0 && (
                    <p className="text-xs font-bold mt-1">
                      Aura change this attempt:{' '}
                      <span
                        className={`${
                          attemptDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {attemptDelta >= 0 ? `+${attemptDelta}` : attemptDelta}
                      </span>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center text-danger">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-ink">Let's try again</h4>
                  <p className="text-xs text-ink-soft">
                    You scored {currentScore} / {questions.length}. You need {passScore} to pass.
                  </p>
                </div>
                <Button variant="secondary" onClick={handleRetry} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}