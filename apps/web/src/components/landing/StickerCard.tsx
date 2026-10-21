import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type StickerAccent = 'accent' | 'secondary' | 'tertiary';

export interface StickerCardProps {
  index: string;
  tag: string;
  title: string;
  description: string;
  footer?: string;
  accent?: StickerAccent;
  className?: string;
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
}: StickerCardProps) {
  return (
    <article
      className={twMerge(
        clsx(
          'wig flex flex-col overflow-hidden rounded-3xl border-2 border-ink bg-surface shadow-pop-lg',
          className
        )
      )}
    >
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
      </div>
    </article>
  );
}
