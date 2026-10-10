'use client';

import React from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Card, Button, Badge } from '@/components/ui';
import { Activity, Droplets, Landmark, AlertTriangle, ArrowRight, Sparkles, Star, Layers } from 'lucide-react';

export default function LabsHubPage() {
  const labs = [
    {
      id: 'liquidity',
      title: 'Constant Product AMM & Slippage Lab',
      badge: 'xy = k Simulator',
      description:
        'Interactive x * y = k AMM pool dynamics. Visualize spot vs execution price impact across Deep ($400k) vs Shallow ($4k) reserve depths.',
      href: '/labs/liquidity',
      lessonHref: '/learn/i1',
      icon: <Droplets className="w-6 h-6 text-accent" />,
      color: 'bg-accent/10',
      iconBg: 'bg-tertiary',
    },
    {
      id: 'multi-pool',
      title: 'Multi-Token Market & Fee Accrual Lab',
      badge: '4-Token Sandbox',
      description:
        'Live trading across 4 distinct pairs (SOL/fUSDC, SOL/BONK, fUSDC/RAY, SOL/JUP). Simulate retail bursts and claim real-time LP fee yields.',
      href: '/labs/multi-pool',
      lessonHref: '/learn/i2',
      icon: <Layers className="w-6 h-6 text-white" />,
      color: 'bg-secondary/10',
      iconBg: 'bg-secondary',
    },
    {
      id: 'money-market',
      title: 'Money Market & Kinked Borrow APY Lab',
      badge: 'Institutional Math',
      description:
        'Explore piecewise interest rate dynamics (Optimal U = 80%, Base 2%, Slope 1 6%, Slope 2 80%), protocol reserve cuts, and simulated bank runs (96% utilization).',
      href: '/labs/money-market',
      lessonHref: '/learn/i6',
      icon: <Landmark className="w-6 h-6 text-quaternary" />,
      color: 'bg-tertiary/30',
      iconBg: 'bg-ink',
    },
    {
      id: 'liquidation',
      title: 'MEV Bot & Liquidation Engine Lab',
      badge: 'Risk & Health Factor',
      description:
        'Live Health Factor gauge calculation, SOL price crash simulation ($70 - $260), and real-time MEV liquidation bot execution with 5% discount bonuses.',
      href: '/labs/liquidation',
      lessonHref: '/learn/i7',
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      color: 'bg-accent/10',
      iconBg: 'bg-tertiary',
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border-2 border-ink text-accent text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-accent" />
                <span>Sandbox Protocol Playgrounds</span>
              </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-ink">
            Rekt School Interactive Labs
          </h1>
          <p className="text-sm sm:text-base text-ink-soft max-w-2xl leading-relaxed">
            Hands-on institutional-grade <strong className="text-ink">sandboxes</strong> — no wallet, no real
            chain, no real funds. Manipulate interest rate curves, stress-test collateral health factors,
            trigger MEV arbitrage bots, and inspect pool slippage.
          </p>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {labs.map((lab) => (
            <Card
              key={lab.id}
              className={`p-6 pt-10 flex flex-col justify-between ${lab.color} shadow-pop-lg hover:rotate-[-1deg] hover:scale-[1.02] transition-all duration-300 ease-bounce`}
            >
              <div
                className={`absolute -top-6 left-6 w-12 h-12 rounded-full ${lab.iconBg} border-2 border-ink flex items-center justify-center`}
              >
                {lab.icon}
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                    {lab.badge}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-ink leading-snug">
                    {lab.title}
                  </h3>
                  <p className="text-xs text-ink-soft mt-2 leading-relaxed">
                    {lab.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link href={lab.href} className="w-full block">
                  <Button variant="primary" className="w-full text-xs flex items-center justify-center gap-1.5">
                    <span>Open Sandbox Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href={lab.lessonHref} className="w-full block">
                  <Button variant="ghost" className="w-full text-xs text-ink-soft hover:text-ink">
                    View with Lesson Guide
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Live Devnet Protocol Practice Banner */}
        <div className="rounded-xl border-2 border-ink bg-white p-6 shadow-pop flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              These labs are simulations — want the real thing?
            </h4>
            <p className="text-xs text-ink-soft leading-relaxed max-w-xl">
              Everything above is a zero-risk sandbox. Ready to take the training wheels off? Practice on
              live Solana <strong className="text-ink">Devnet</strong> deployments on Raydium, Kamino Finance,
              and Jupiter with your faucet SOL and fUSDC.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://raydium.io/swap/?chain=solanaDevnet"
              target="_blank"
              rel="noopener noreferrer"
            >
                <Button variant="secondary" size="sm" className="text-xs">
                  Raydium Devnet
                </Button>
            </a>
            <a
              href="https://faucet.solana.com"
              target="_blank"
              rel="noopener noreferrer"
            >
                <Button variant="secondary" size="sm" className="text-xs">
                  Solana Faucet
                </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
