import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'accent' | 'warn' | 'danger' | 'info' | 'devnet' | 'sandbox' | 'outline' | 'pink' | 'yellow' | 'mint';
}

export function Badge({
  className,
  variant = 'primary',
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide select-none border-2 border-ink';

  const variants = {
    primary: 'bg-accent text-white',
    accent: 'bg-accent text-white',
    warn: 'bg-tertiary text-ink',
    danger: 'bg-red-500 text-white',
    info: 'bg-quaternary text-ink',
    devnet: 'bg-tertiary text-ink font-mono uppercase tracking-wider',
    sandbox: 'bg-secondary text-white font-mono uppercase tracking-wider',
    outline: 'bg-white text-ink',
    pink: 'bg-secondary text-white',
    yellow: 'bg-tertiary text-ink',
    mint: 'bg-quaternary text-ink',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </span>
  );
}
