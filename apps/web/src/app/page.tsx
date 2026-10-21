'use client';

import React from 'react';
import { TopBar } from '@/components/layout/TopBar';
import {
  ArcadeGames,
  FaqChat,
  FinalCta,
  FreeLessonCards,
  HomeHero,
  LevelMap,
  PricingSection,
  SectionHeading,
  SiteFooter,
  WarStories,
} from '@/components/landing';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <TopBar showAura={false} showWallet={false} cta={{ label: 'Start free', href: '#free' }} />

      <main className="flex flex-col">
        <HomeHero />
        <LevelMap />

        <section
          id="free"
          className="scroll-mt-24 border-y-2 border-ink bg-surface-muted"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-9 px-6 py-20 lg:py-24">
            <SectionHeading
              eyebrow="Free forever — no wallet"
              title="Try it before you pay a rupee."
              lede="One lesson from every level, plus the whole arcade — no wallet, no sign-up, no real money."
            />
            <FreeLessonCards />
            <ArcadeGames />
          </div>
        </section>

        <WarStories />
        <PricingSection />
        <FaqChat />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}
