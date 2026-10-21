import React from 'react';
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
        <SectionHeading
          eyebrow="War Stories · Case files"
          title="Learn from other people’s money."
          tone="pink"
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-7">
          {CASES.map((warCase) => (
            <CaseFile key={warCase.href} {...warCase} />
          ))}
        </div>
      </div>
    </section>
  );
}
