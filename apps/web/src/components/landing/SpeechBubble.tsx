import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type SpeechTone = 'white' | 'accent' | 'muted';

export type AvatarShape = 'circle' | 'dome' | 'square';

export interface SpeechBubbleProps {
  children: React.ReactNode;
  tone?: SpeechTone;
  className?: string;
  /** Letter avatar shown next to the bubble (Maxi, Nina, ...). */
  avatar?: {
    letter: string;
    shape?: AvatarShape;
    tone?: 'accent' | 'green';
  };
}

const TONE_CLASSES: Record<SpeechTone, string> = {
  white: 'bg-surface text-ink',
  accent: 'bg-accent-strong text-white',
  muted: 'bg-surface-muted text-ink',
};

const AVATON_SHAPES: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  dome: 'rounded-t-full',
  square: 'rounded-xl',
};

/**
 * Chat style bubble with a squared-off bottom-left corner, matching the
 * Maxi / Nina conversation style used across the site.
 */
export function SpeechBubble({ children, tone = 'white', className, avatar }: SpeechBubbleProps) {
  return (
    <div className={twMerge(clsx('flex items-end gap-3', className))}>
      {avatar && (
        <span
          aria-hidden="true"
          className={twMerge(
            clsx(
              'inline-flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink',
              'font-heading text-xl font-extrabold text-white',
              AVATON_SHAPES[avatar.shape ?? 'circle'],
              avatar.tone === 'green' ? 'bg-quaternary text-ink' : 'bg-accent'
            )
          )}
        >
          {avatar.letter}
        </span>
      )}
      <div
        className={twMerge(
          clsx(
            'rounded-2xl rounded-bl-none border-2 border-ink px-4 py-3 text-[15px] font-medium',
            TONE_CLASSES[tone]
          )
        )}
      >
        {children}
      </div>
    </div>
  );
}
