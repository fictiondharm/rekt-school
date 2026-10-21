import React from 'react';
import { CandyButton } from '@/components/landing/CandyButton';

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-t-full rounded-b-3xl border-2 border-ink bg-tertiary px-8 pb-14 pt-[72px] text-center shadow-pop-ink-lg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#1E293B 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
          }}
        />
        <h2 className="relative m-0 max-w-[680px] font-heading text-[clamp(32px,4.4vw,56px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
          Break DeFi tonight. Free, in 5 minutes.
        </h2>
        <CandyButton href="#free" withArrow className="relative">
          Play the free lesson
        </CandyButton>
      </div>
    </section>
  );
}
