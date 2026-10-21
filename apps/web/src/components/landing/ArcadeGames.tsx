import React from 'react';
import Link from 'next/link';
import { Character, type CharId } from '@/components/games/Character';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ArcadeGame {
  id: string;
  title: string;
  presenter: string;
  quote: string;
  meta: string;
  href: string;
  character: CharId;
  mood: 'buy' | 'walk';
  /** Tailwind classes for the mascot badge shape. */
  badgeClass: string;
  /** Tailwind classes for the card shadow. */
  shadowClass: string;
}

const GAMES: ArcadeGame[] = [
  {
    id: 'rug-tycoon',
    title: 'Rug Tycoon',
    presenter: 'Rugsy presents',
    quote: '“Launch a token. Fake some hype. Let’s see if they notice.”',
    meta: '3 rounds · Play →',
    href: '/games/rug-tycoon',
    character: 'rugsy',
    mood: 'walk',
    badgeClass: 'rounded-full bg-secondary',
    shadowClass: 'shadow-pop-pink',
  },
  {
    id: 'liquidation-line',
    title: 'Liquidation Line',
    presenter: 'Liquidator Bot presents',
    quote: '“20x leverage? Bold. I’ll be waiting at your liquidation price.”',
    meta: '5 rounds · Play →',
    href: '/games/liquidation-line',
    character: 'liquidator',
    mood: 'walk',
    badgeClass: 'rotate-[-8deg] rounded-xl bg-tertiary',
    shadowClass: 'shadow-pop-tertiary',
  },
  {
    id: 'pool-party',
    title: 'Pool Party',
    presenter: 'Newbie Nina presents',
    quote: '“Six days of fees! Wait… why is my SOL disappearing?”',
    meta: '6 days · Play →',
    href: '/games/pool-party',
    character: 'nina',
    mood: 'buy',
    badgeClass: 'rounded-t-full bg-quaternary',
    shadowClass: 'shadow-pop-mint',
  },
];

export function ArcadeGames() {
  return (
    <div id="arcade" className="flex flex-col gap-5 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="m-0 font-heading text-[28px] font-extrabold leading-tight text-ink">
          The Arcade
        </h3>
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-4 py-2 text-sm font-bold text-ink shadow-pop-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
        >
          Open the Arcade hub <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-7">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            href={game.href}
            className={twMerge(
              clsx(
                'wig relative flex flex-col gap-3 rounded-3xl border-2 border-ink bg-surface p-6 pt-11 text-ink',
                game.shadowClass,
                'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent'
              )
            )}
          >
            <span
              aria-hidden="true"
              className={twMerge(
                clsx(
                  'absolute -top-7 left-6 flex h-14 w-14 items-center justify-center border-2 border-ink',
                  game.badgeClass
                )
              )}
            >
              <Character id={game.character} mood={game.mood} size={44} title={game.title} />
            </span>
            <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-ink">
              {game.presenter}
            </span>
            <span className="font-heading text-[28px] font-extrabold leading-tight text-ink">
              {game.title}
            </span>
            <span className="rounded-2xl rounded-bl-none border-2 border-ink bg-surface-muted px-3.5 py-3 text-[15px] font-medium leading-relaxed text-ink">
              {game.quote}
            </span>
            <span className="text-sm font-bold text-ink">{game.meta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
