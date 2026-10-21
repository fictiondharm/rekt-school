import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CandyButtonProps {
  /** Renders an anchor when provided, a button otherwise. */
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  /** Renders the round arrow chip used on the "Play the free lesson" buttons. */
  withArrow?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const BASE_CLASSES =
  'pop inline-flex items-center justify-center gap-3 rounded-full border-2 border-ink bg-accent-strong ' +
  'min-h-[52px] font-bold text-white shadow-pop ' +
  'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent ' +
  'disabled:pointer-events-none disabled:opacity-60';

/**
 * The primary call to action: a hard-shadowed pill that lifts on hover and
 * presses in on click.
 */
export function CandyButton({
  href,
  onClick,
  children,
  className,
  withArrow = false,
  type = 'button',
  disabled = false,
}: CandyButtonProps) {
  const classes = twMerge(
    clsx(BASE_CLASSES, withArrow ? 'pl-6 pr-2 text-[17px]' : 'px-6 text-[17px]', className)
  );

  const content = (
    <>
      {children}
      {withArrow && (
        <span
          aria-hidden="true"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white"
        >
          <ArrowRight className="h-[18px] w-[18px] text-ink" strokeWidth={2.5} />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
