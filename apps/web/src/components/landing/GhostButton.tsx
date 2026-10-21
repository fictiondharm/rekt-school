import React from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface GhostButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Secondary call to action: outlined pill that fills with yellow on hover.
 */
export function GhostButton({ href, children, className, onClick }: GhostButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={twMerge(
        clsx(
          'ghost inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-ink',
          'bg-bg px-6 text-[17px] font-bold text-ink',
          'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent',
          className
        )
      )}
    >
      {children}
    </Link>
  );
}
