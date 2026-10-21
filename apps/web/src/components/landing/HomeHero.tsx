'use client';

import React from 'react';
import { useLiquidityLab } from '@/hooks/useLiquidityLab';
import { CandyButton } from '@/components/landing/CandyButton';
import { GhostButton } from '@/components/landing/GhostButton';
import { LiquidityLabCard } from '@/components/landing/LiquidityLabCard';
import { SpeechBubble } from '@/components/landing/SpeechBubble';
import { TOTAL_LESSON_COUNT, UNLOCK_PRICE_INR } from '@/lib/pricing';

export function HomeHero() {
  const lab = useLiquidityLab({ autoPlay: true, strategy: 'sweep' });

  return (
    <section
      id="top"
      className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center gap-14 px-6 py-20 lg:py-24"
    >
      <div className="relative z-[1] flex min-w-0 flex-1 basis-[460px] flex-col gap-7">
        <div className="self-start rounded-full border-2 border-ink bg-surface px-4 py-2 text-[13px] font-bold uppercase tracking-[0.08em] text-ink shadow-pop-xs">
          Solana DeFi · {TOTAL_LESSON_COUNT} labs · ₹0 at risk
        </div>

        <h1 className="m-0 font-heading text-[clamp(46px,6.4vw,80px)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink">
          Get rekt here.
          <br />
          Not on{' '}
          <span className="relative inline-block">
            mainnet.
            <svg
              aria-hidden="true"
              viewBox="0 0 240 18"
              preserveAspectRatio="none"
              className="absolute bottom-[-10px] left-0 h-4 w-full"
            >
              <path
                d="M2 12 Q 22 2 42 10 T 82 10 T 122 10 T 162 10 T 202 10 T 238 8"
                fill="none"
                stroke="var(--secondary)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="m-0 max-w-[500px] text-[19px] leading-relaxed text-ink">
          Drain pools, trigger liquidations and spot rugs with fake money — so you never do it
          with real money.
        </p>

        <div className="flex flex-wrap gap-3.5">
          <CandyButton href="#free" withArrow>
            Play the free lesson
          </CandyButton>
          <GhostButton href="#pricing">Unlock all · ₹{UNLOCK_PRICE_INR}</GhostButton>
        </div>

        <div className="text-sm font-medium text-ink-soft">
          No sign-up. No wallet. Lesson 1 runs in your browser.
        </div>
      </div>

      <div className="relative z-[1] flex min-w-0 flex-1 basis-[440px] flex-col gap-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-9 top-14 -z-[1] h-[380px] w-[300px] opacity-25 desktop:block"
          style={{
            backgroundImage: 'radial-gradient(#1E293B 2px, transparent 2px)',
            backgroundSize: '18px 18px',
          }}
        />
        <SpeechBubble avatar={{ letter: 'M' }} className="self-start">
          <b>Maxi:</b> {lab.maxiLine}
        </SpeechBubble>
        <LiquidityLabCard lab={lab} />
      </div>
    </section>
  );
}
