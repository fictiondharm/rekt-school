import React from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Card, Badge, Button, Disclaimer } from '@/components/ui';
import { getAllCases } from '@/lib/cases';
import { ArrowLeft, ArrowRight, Flame, Skull, Search, Wallet, FileWarning } from 'lucide-react';

export const metadata = {
  title: 'War Stories - Rekt School',
  description: 'Real Solana exploits, told through the on-chain evidence and the exact research method investigators used to trace them.',
};

export default function WarStoriesPage() {
  const cases = getAllCases();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar lessonTitle="War Stories" />

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 sm:p-8 space-y-10">
        <div>
          <Link
            href="/learn/b1"
            className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Lessons
          </Link>
        </div>

        <section className="text-center space-y-5 py-6">
          <Badge variant="danger" className="gap-1.5">
            <Skull className="w-3.5 h-3.5" /> WAR STORIES
          </Badge>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight leading-tight">
            Learn from <span className="text-accent">other people's money.</span>
          </h1>
          <p className="text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Every case below is a real Solana exploit, reconstructed from the on-chain
            evidence and public filings. You will see the wallets, the transactions, the
            mistakes - and the exact research method investigators used to trace it all.
            This is the skill nobody teaches: how to read a chain like a detective.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Search, title: 'See the whole attack', body: 'A minute-by-minute timeline, not a one-line headline.' },
            { icon: Wallet, title: 'Wallets & transactions', body: 'The real actors and moves, with explorer links.' },
            { icon: FileWarning, title: 'Learn the method', body: 'Step-by-step how a tracer reconstructs a case from scratch.' },
          ].map((item) => (
            <Card key={item.title} className="p-4 space-y-2 border-2 border-ink rounded-xl shadow-pop">
              <item.icon className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-bold text-sm">{item.title}</h3>
              <p className="text-xs text-ink-soft leading-relaxed">{item.body}</p>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="font-heading font-bold text-xl flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" /> The Case Files
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {cases.map((c) => (
              <Link key={c.id} href={`/war-stories/${c.id}`}>
                <Card
                  variant="interactive"
                  className="p-5 space-y-3 border-2 border-ink rounded-xl shadow-pop h-full"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="danger" className="text-[10px] px-2 py-0.5">
                      {c.lossUsd.split('(')[0].trim()}
                    </Badge>
                    <span className="font-mono text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                      {c.chain}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg leading-snug">{c.title}</h3>
                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">{c.tldr}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      {c.category}
                    </Badge>
                    <Badge variant="yellow" className="text-[10px] px-2 py-0.5">
                      {c.dateLabel}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                    Read the case <ArrowRight className="w-3 h-3" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="text-center space-y-4 pb-8">
          <p className="text-sm text-ink-soft max-w-xl mx-auto">
            More cases land here as we trace them - bridges, stablecoin depegs, audit failures
            and rug pulls. Each one replays the real numbers in the matching sandbox lab.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pro">
              <Button variant="primary" className="gap-2">
                <Flame className="w-4 h-4" /> Explore the Pro labs
              </Button>
            </Link>
            <Link href="/glossary">
              <Button variant="secondary" className="gap-2">
                Open the Glossary
              </Button>
            </Link>
          </div>
        </section>

        <Disclaimer />
      </main>
    </div>
  );
}
