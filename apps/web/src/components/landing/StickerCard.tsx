import React from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowRight } from 'lucide-react';

export type StickerAccent = 'accent' | 'secondary' | 'tertiary';

export interface StickerCardProps {
  index: string;
  tag: string;
  title: string;
  description: string;
  footer?: string;
  accent?: StickerAccent;
  className?: string;
  /** When set the whole card becomes a link to that route. */
  href?: string;
}

const HEADER_CLASSES: Record<StickerAccent, string> = {
  accent: 'bg-accent text-white',
  secondary: 'bg-secondary text-white',
  tertiary: 'bg-tertiary text-ink',
};

/**
 * Level card with a coloured header band, used by the level map.
 */
export function StickerCard({
  index,
  tag,
  title,
  description,
  footer,
  accent = 'accent',
  className,
  href,
}: StickerCardProps) {
  const body = (
    <>
      <div
        className={twMerge(
          clsx(
            'flex items-center justify-between gap-3 border-b-2 border-ink px-5 py-4',
            HEADER_CLASSES[accent]
          )
        )}
      >
        <span className="font-heading text-4xl font-extrabold leading-none">{index}</span>
        <span className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold text-ink">
          {tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 py-5">
        <h3 className="m-0 font-heading text-[28px] font-extrabold leading-tight text-ink">
          {title}
        </h3>
        <p className="m-0 leading-relaxed text-ink-soft">{description}</p>
        {footer && (
          <div className="mt-auto pt-2 text-sm font-bold text-ink">{footer}</div>
        )}
        {href && (
          <div className="flex items-center gap-1 pt-1 text-sm font-bold text-accent">
            Open {title} <ArrowRight className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </>
  );

  const cardClass = twMerge(
    clsx(
      'wig flex flex-col overflow-hidden rounded-3xl border-2 border-ink bg-surface shadow-pop-lg',
      href && 'transition-transform hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent',
      className
    )
  );

  if (href) {
    return (
      <Link href={href} className={cardClass} aria-label={`${title} - open the ${title} lessons`}>
        {body}
      </Link>
    );
  }

  return <article className={cardClass}>{body}</article>;
}
