import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
  /** Pink eyebrows are used for the war stories section. */
  tone?: 'accent' | 'pink';
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  className,
  align = 'left',
  tone = 'accent',
}: SectionHeadingProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col gap-3',
          align === 'center' ? 'items-center text-center' : 'items-start',
          className
        )
      )}
    >
      <div
        className={twMerge(
          clsx(
            'text-[13px] font-bold uppercase tracking-[0.1em]',
            tone === 'pink' ? 'text-secondary-dark' : 'text-accent-strong'
          )
        )}
      >
        {eyebrow}
      </div>
      <h2
        className={twMerge(
          clsx(
            'm-0 max-w-2xl font-heading text-[clamp(36px,4.4vw,56px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink'
          )
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={twMerge(
            clsx(
              'm-0 max-w-2xl text-lg leading-relaxed text-ink-soft',
              align === 'center' && 'mx-auto'
            )
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
