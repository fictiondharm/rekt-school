'use client';

import React from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Card, Badge, Button, Disclaimer } from '@/components/ui';
import { ChefHat, Flame, Lock, Sparkles, ArrowLeft, Construction } from 'lucide-react';

const menuItems = [
  { title: 'Advanced AMM Engineering', desc: 'Concentrated liquidity, tick math, and pool design from scratch.' },
  { title: 'MEV & Sandwich Defense', desc: 'Watch bots front-run, and learn how to route around them.' },
  { title: 'Liquidation Hunting', desc: 'Health factors, oracle latency, and profiting from liquidations.' },
  { title: 'Cross-chain Yield', desc: 'Bridge risk, funding rates, and delta-neutral strategies.' },
  { title: 'On-chain Forensics', desc: 'Follow smart money, trace wallets, and actually read the chain.' },
  { title: 'Portfolio Risk Engine', desc: 'VaR, correlation, and stress tests for real DeFi positions.' },
];

export default function ProPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar lessonTitle="Pro" />

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
          <Badge variant="yellow" className="gap-1.5">
            <Construction className="w-3.5 h-3.5" /> COOKING IN THE LAB
          </Badge>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight leading-tight">
            We&apos;re cooking something <span className="text-accent">serious</span>.
          </h1>
          <p className="text-ink-soft max-w-2xl mx-auto leading-relaxed">
            The Pro tier is still in the kitchen. Deep-dive modules, advanced strategies, and
            pro-grade tooling are on the menu — it&apos;ll be plated soon. Stay tuned, it&apos;s worth the wait.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-ink-faint">
            <Flame className="w-4 h-4 text-accent" /> Status: simmering
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading font-bold text-xl flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-accent" /> On the menu
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Card
                key={item.title}
                className="p-5 space-y-2 border-2 border-ink rounded-xl shadow-pop"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-bold text-base">{item.title}</h3>
                  <Lock className="w-4 h-4 text-ink-faint shrink-0" />
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">{item.desc}</p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-ink-faint">
                  Coming soon
                </span>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center space-y-4 pb-8">
          <p className="text-sm text-ink-soft">Want a seat at the table when it drops? Keep the streak going.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/learn/b1">
              <Button variant="primary" className="gap-2">
                <Sparkles className="w-4 h-4" /> Start the basics
              </Button>
            </Link>
            <Link href="/labs">
              <Button variant="secondary" className="gap-2">
                Explore the Labs
              </Button>
            </Link>
          </div>
        </section>

        <Disclaimer />
      </main>
    </div>
  );
}
