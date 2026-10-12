'use client';

import React, { useState } from 'react';
import { ChevronDown, MousePointerClick, Eye, Lightbulb, Wrench } from 'lucide-react';
import type { Case } from '@defi-mommy/content-schema';

type ResearchStep = Case['researchMethod'][number];

export function InvestigatorPlaybook({ steps }: { steps: ResearchStep[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-accent/5 border-2 border-accent/30 space-y-1.5">
        <p className="text-sm text-ink leading-relaxed">
          You are the detective. Someone moved money that was not theirs, and all you have is
          a public blockchain and a few free websites. The five moves below are the same routine
          professional investigators run on <strong>almost any</strong> exploit - bridges, oracles,
          rug pulls. No coding required, just curiosity.
        </p>
      </div>

      <ol className="space-y-2.5">
        {steps.map((s, i) => {
          const isOpen = open === i;
          return (
            <li
              key={i}
              className={`rounded-xl border-2 overflow-hidden bg-surface transition-shadow ${
                isOpen ? 'border-ink shadow-pop' : 'border-border'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-accent/5 transition-colors"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-white border-2 border-ink flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0 font-heading font-bold text-sm leading-snug pt-1">
                  {s.step}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-accent shrink-0 mt-1 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-2.5">
                  <p className="text-sm text-ink-soft leading-relaxed">{s.detail}</p>
                  {s.doThis && (
                    <Row
                      icon={<MousePointerClick className="w-4 h-4 text-accent" />}
                      label="Do this"
                      text={s.doThis}
                    />
                  )}
                  {s.lookFor && (
                    <Row
                      icon={<Eye className="w-4 h-4 text-danger" />}
                      label="Look for"
                      text={s.lookFor}
                      variant="danger"
                    />
                  )}
                  {s.example && (
                    <Row
                      icon={<Lightbulb className="w-4 h-4 text-accent" />}
                      label="In this case"
                      text={s.example}
                    />
                  )}
                  {s.tools && s.tools.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <Wrench className="w-3.5 h-3.5 text-ink-faint" />
                      {s.tools.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg border border-border text-ink-faint"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Row({
  icon,
  label,
  text,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  variant?: 'default' | 'danger';
}) {
  return (
    <div
      className={`flex gap-2.5 p-3 rounded-lg border ${
        variant === 'danger' ? 'bg-danger/5 border-danger/25' : 'bg-bg border-border'
      }`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="space-y-0.5 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
          {label}
        </div>
        <p className="text-xs text-ink leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
