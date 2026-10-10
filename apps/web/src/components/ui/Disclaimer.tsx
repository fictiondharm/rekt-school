import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DisclaimerProps {
  className?: string;
}

export function Disclaimer({ className }: DisclaimerProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center gap-3 px-5 py-3 rounded-xl bg-white border-2 border-ink text-ink-soft text-xs leading-normal select-none shadow-pop-sm',
          className
        )
      )}
    >
      <div className="w-7 h-7 rounded-full bg-tertiary border-2 border-ink flex items-center justify-center shrink-0">
        <ShieldAlert className="w-4 h-4 text-ink" />
      </div>
      <div>
        <span className="font-bold text-ink">Educational purposes only. Not financial advice.</span>{' '}
        Tier 1 runs on Solana Devnet and Tier 2 in a sandbox — both use fake money. Never risk real funds.
      </div>
    </div>
  );
}
