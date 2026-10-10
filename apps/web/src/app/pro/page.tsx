'use client';

import React from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Card, Badge, Button, Disclaimer } from '@/components/ui';
import { ChefHat, Flame, Sparkles, ArrowLeft, Construction, FlaskConical, Hourglass } from 'lucide-react';

const roadmapItems = [
  { id: 'P1', title: 'Order Types (Market, Limit, Stops)', tag: 'SIM', lab: 'Order Desk Simulator' },
  { id: 'P2', title: 'Order Books vs AMMs (CLOB Depth)', tag: 'SIM', lab: 'Live Order Book & Spread Lab' },
  { id: 'P3', title: 'Leverage & Perpetuals (Margin & PnL)', tag: 'SIM', lab: '1x–20x Perps Simulator' },
  { id: 'P4', title: 'Funding Rates & Mark Price', tag: 'SIM', lab: 'Funding Rate Arbitrage Lab' },
  { id: 'P5', title: 'Oracles & Flash Loan Attacks', tag: 'SIM', lab: 'Oracle Attack Simulation' },
  { id: 'P6', title: 'MEV, Sandwiches & Priority Fees', tag: 'SIM', lab: 'Sandwich Bot Attack & Defense Lab' },
  { id: 'P7', title: 'Concentrated Liquidity (CLMM)', tag: 'SIM', lab: 'Tick Range & Capital Efficiency Lab' },
  { id: 'P8', title: 'Cross-Chain Bridges & Exploits', tag: 'ONCHAIN', lab: 'Bridge Lock-and-Mint Simulator' },
  { id: 'P9', title: 'Memecoins & Bonding Curves', tag: 'SIM', lab: 'Bonding Curve Sniper Simulator' },
  { id: 'P10', title: 'Smart Contract Security Auditing', tag: 'SIM', lab: 'Red Flag Audit Checklist' },
  { id: 'P11', title: 'Risk Management & Drawdown Math', tag: 'SIM', lab: 'Position Sizing & Kelly Criterion' },
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
            11 pro-grade modules are on the roadmap — order types, perps, MEV, bridges, and more.
            It&apos;ll be plated soon. Stay tuned, it&apos;s worth the wait.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-ink-faint">
            <Flame className="w-4 h-4 text-accent" /> Status: simmering
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading font-bold text-xl flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-accent" /> Coming to Pro
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roadmapItems.map((item) => (
              <Card
                key={item.id}
                className="p-5 space-y-3 border-2 border-ink rounded-xl shadow-pop"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border-2 border-ink bg-bg">
                    {item.id}
                  </span>
                  <Badge
                    variant={item.tag === 'ONCHAIN' ? 'sandbox' : 'yellow'}
                    className="text-[10px] px-2 py-0.5"
                  >
                    {item.tag}
                  </Badge>
                </div>
                <h3 className="font-heading font-bold text-base leading-snug min-h-[2.75rem]">
                  {item.title}
                </h3>
                <div className="flex items-start gap-1.5 text-xs text-ink-soft">
                  <FlaskConical className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span>{item.lab}</span>
                </div>
                <div className="pt-2 border-t border-border flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink-faint">
                  <Hourglass className="w-3 h-3" /> Roadmap
                </div>
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
