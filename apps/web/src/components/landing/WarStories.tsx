import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CaseFile } from '@/components/landing/CaseFile';
import { SectionHeading } from '@/components/landing/SectionHeading';

const CASES = [
  {
    caseNumber: 'CASE #001',
    date: 'FEB 2, 2022',
    title: 'Wormhole',
    loss: 'DRAINED $326M',
    rootCause: 'the bridge checked a forged signature account. 120,000 ETH minted from nothing.',
    href: '/war-stories/wormhole',
  },
  {
    caseNumber: 'CASE #002',
    date: 'OCT 11, 2022',
    title: 'Mango Markets',
    loss: 'DRAINED $114M',
    rootCause: 'no code bug. One trader pumped the oracle price and borrowed the vault empty.',
    href: '/war-stories/mango-markets',
  },
  {
    caseNumber: 'CASE #003',
    date: 'MAR 23, 2022',
    title: 'Cashio',
    loss: 'DRAINED $52.8M',
    rootCause: 'fake accounts vouched for each other and minted 2 billion CASH.',
    href: '/war-stories/cashio',
  },
];

export function WarStories() {
  return (
    <section
      id="cases"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-20 lg:py-24"
    >
      <div className="flex flex-col gap-11">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="War Stories · Case files"
            title="Learn from other people’s money."
            tone="pink"
          />
          <Link
            href="/war-stories"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-4 py-2 text-sm font-bold text-ink shadow-pop-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
          >
            All case files <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-7">
          {CASES.map((warCase) => (
            <CaseFile key={warCase.href} {...warCase} />
          ))}
        </div>
      </div>
    </section>
  );
}
