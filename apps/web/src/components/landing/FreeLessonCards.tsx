import React from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface FreeLesson {
  id: string;
  duration: string;
  title: string;
  href: string;
  /** Tailwind text colour for the "B1 · 5 MIN" label. */
  labelClass: string;
}

export const FREE_LESSONS: FreeLesson[] = [
  {
    id: 'B1',
    duration: '5 MIN',
    title: 'How the course works',
    href: '/learn/b1',
    labelClass: 'text-accent-strong',
  },
  {
    id: 'I1',
    duration: '8 MIN',
    title: 'How a liquidity pool really works',
    href: '/learn/i1',
    labelClass: 'text-secondary-dark',
  },
  {
    id: 'P5',
    duration: '18 MIN',
    title: 'Oracles & flash loan attacks',
    href: '/learn/p5',
    labelClass: 'text-tertiary-dark',
  },
];

export function FreeLessonCards() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
      {FREE_LESSONS.map((lesson) => (
        <Link
          key={lesson.id}
          href={lesson.href}
          className={twMerge(
            clsx(
              'wig flex flex-col gap-2 rounded-[20px] border-2 border-ink bg-surface p-5 text-ink shadow-pop',
              'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent'
            )
          )}
        >
          <span className={twMerge(clsx('text-[13px] font-bold', lesson.labelClass))}>
            {lesson.id} · {lesson.duration}
          </span>
          <span className="font-heading text-[21px] font-extrabold leading-snug">
            {lesson.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
