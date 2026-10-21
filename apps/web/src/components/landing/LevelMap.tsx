import React from 'react';
import { SectionHeading } from '@/components/landing/SectionHeading';
import { StickerCard } from '@/components/landing/StickerCard';
import { LESSON_COUNTS } from '@/lib/pricing';

/**
 * The level map: three sticker cards joined by a dashed path.
 * The path is decorative and is hidden on small screens.
 */
export function LevelMap() {
  return (
    <section id="course" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-20 lg:py-24">
      <div className="flex flex-col gap-14">
        <SectionHeading eyebrow="The level map" title="Start easy. Finish dangerous." />

        <div className="relative">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-10 hidden h-[120px] w-full desktop:block"
            viewBox="0 0 1100 120"
            preserveAspectRatio="none"
          >
            <path
              d="M60 60 C 250 -20, 330 140, 550 60 S 850 -20, 1040 60"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="3"
              strokeDasharray="10 10"
            />
          </svg>

          <div className="relative z-[1] grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-7">
            <StickerCard
              index="01"
              tag="SOLANA DEVNET"
              title="Basic"
              description="Real wallet, free faucet money. Mint a token, make your first swap, check it on an explorer."
              footer={`${LESSON_COUNTS.basic} lessons · ~84 min`}
              accent="accent"
              href="/basic"
            />
            <StickerCard
              index="02"
              tag="SANDBOX"
              title="Intermediate"
              description="Push every curve until it breaks. AMMs, impermanent loss, lending, liquidations, tokenomics."
              footer={`${LESSON_COUNTS.intermediate} lessons`}
              accent="secondary"
              href="/intermediate"
            />
            <StickerCard
              index="03"
              tag="BOSS LEVEL"
              title="Pro"
              description="What actually drains wallets: flash loans, oracle attacks, MEV, perps. Ends with a capstone audit."
              footer={`${LESSON_COUNTS.pro} lessons`}
              accent="tertiary"
              href="/pro"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
