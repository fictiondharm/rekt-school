'use client';

import Link from 'next/link';
import { WalletChip } from '@/components/onchain/WalletChip';
import { Badge } from '@/components/ui';
import { getNetworkMeta, getNetworkMetaByLesson } from '@/lib/tier';
import { Sparkles } from 'lucide-react';
import type { Tier } from '@defi-mommy/content-schema';

interface TopBarProps {
  lessonTitle?: string;
  aura?: number;
  streak?: number;
  showTourButton?: boolean;
  tier?: Tier;
  lessonId?: string;
}

export function TopBar({ lessonTitle, aura = 0, streak = 0, showTourButton = false, tier, lessonId }: TopBarProps) {
  const net = lessonId
    ? getNetworkMetaByLesson(lessonId)
    : tier
    ? getNetworkMeta(tier)
    : undefined;
  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            aria-label="Rekt School home"
            className="flex items-center gap-3 text-ink hover:opacity-80 transition-opacity"
          >
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-none tracking-tight">Rekt School</span>
              {lessonTitle && (
                <span className="font-medium text-xs tracking-wider text-ink-faint mt-1">{lessonTitle}</span>
              )}
              {net && (
                <Badge
                  variant={net.badgeVariant}
                  className="mt-1 w-fit text-[9px] px-2 py-0.5"
                >
                  {net.badgeLabel}
                </Badge>
              )}
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/learn/b1"
              className="font-bold text-sm hover:underline underline-offset-4"
            >
              Basic
            </Link>
            <Link
              href="/learn/i1"
              className="font-bold text-sm hover:underline underline-offset-4"
            >
              Intermediate
            </Link>
            <Link
              href="/labs"
              className="font-bold text-sm hover:underline underline-offset-4"
            >
              Labs
            </Link>
            <Link
              href="/glossary"
              className="font-bold text-sm hover:underline underline-offset-4"
            >
              Glossary
            </Link>
            <Link
              href="/pro"
              className="font-bold text-sm hover:underline underline-offset-4"
            >
              Pro
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {showTourButton && (
              <button className="bg-tertiary text-ink border-2 border-ink px-4 py-1.5 font-bold text-xs rounded-full hover:shadow-pop-sm transition-all active:translate-x-[1px] active:translate-y-[1px]">
                Tour
              </button>
            )}
            <div
              data-tour="topbar-aura"
              title="Aura: correct answers add Aura, wrong ones subtract it"
              className="bg-tertiary text-ink border-2 border-ink px-3 py-1 font-bold text-sm rounded-full flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {aura} Aura
            </div>
            <WalletChip />
          </div>
        </div>
      </div>
    </header>
  );
}