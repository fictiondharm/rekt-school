import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckItemProps {
  children: React.ReactNode;
  className?: string;
  /** Mint ticks are used for the paid plan, grey ticks for the free plan. */
  tone?: 'muted' | 'mint';
}

export function CheckItem({ children, className, tone = 'muted' }: CheckItemProps) {
  return (
    <div className={twMerge(clsx('flex items-center gap-2.5 font-medium', className))}>
      <span
        aria-hidden="true"
        className={twMerge(
          clsx(
            'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink',
            tone === 'mint' ? 'bg-quaternary' : 'bg-border'
          )
        )}
      >
        <Check className="h-3 w-3 text-ink" strokeWidth={3.5} />
      </span>
      <span>{children}</span>
    </div>
  );
}
