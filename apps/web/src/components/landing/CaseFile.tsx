import React from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CaseFileProps {
  caseNumber: string;
  date: string;
  title: string;
  loss: string;
  rootCause: string;
  href: string;
}

/**
 * A war story presented as a case file: torn corner, red stamp, root cause.
 */
export function CaseFile({
  caseNumber,
  date,
  title,
  loss,
  rootCause,
  href,
}: CaseFileProps) {
  return (
    <Link
      href={href}
      className={twMerge(
        clsx(
          'wig flex flex-col gap-3.5 rounded-[4px_24px_24px_24px] border-2 border-ink bg-surface p-6 text-ink shadow-pop',
          'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent'
        )
      )}
    >
      <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
        {caseNumber} · {date}
      </span>
      <span className="font-heading text-[30px] font-extrabold leading-tight text-ink">
        {title}
      </span>
      <span className="self-start -rotate-2 rounded-lg border-[3px] border-secondary-dark px-3 py-1 font-heading text-2xl font-extrabold text-secondary-dark">
        {loss}
      </span>
      <span className="text-[15px] leading-relaxed text-ink">
        <b>Root cause:</b> {rootCause}
      </span>
    </Link>
  );
}
