'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { simulateCliffSellPressure } from '@defi-mommy/sim-core';
import {
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Info,
  DollarSign,
  Activity,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function I10Companion() {
  const [unlockAmount, setUnlockAmount] = useState(50_000_000); // 50M tokens unlock
  const [sellerPct, setSellerPct] = useState(40); // 40% sold
  const [poolDepthTier, setPoolDepthTier] = useState<'shallow' | 'medium' | 'deep'>('medium');
  const [isTourActive, setIsTourActive] = useState(false);

  // Pool depths: token vs USD reserves
  // Token starting price = $0.10
  const poolConfigs = {
    shallow: { tokens: 10_000_000, usd: 1_000_000, label: '$1M Shallow AMM' },
    medium: { tokens: 50_000_000, usd: 5_000_000, label: '$5M Standard AMM' },
    deep: { tokens: 200_000_000, usd: 20_000_000, label: '$20M Ocean Depth' },
  };

  const currentPool = poolConfigs[poolDepthTier];

  const result = simulateCliffSellPressure({
    unlockedTokensAmount: unlockAmount,
    sellerParticipationPct: sellerPct,
    poolTokenReserves: currentPool.tokens,
    poolUSDReserves: currentPool.usd,
  });

  const handleReset = () => {
    setUnlockAmount(50_000_000);
    setSellerPct(40);
    setPoolDepthTier('medium');
  };

  const tourSteps = [
    {
      target: '[data-tour="i10-lab-header"]',
      title: 'Welcome to Cliff Day',
      text: 'This panel simulates the single most dangerous day in a token calendar: the cliff unlock. Millions of tokens suddenly become sellable - and you get to see the price carnage before it happens.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i10-controls"]',
      title: 'Load the Cannon',
      text: 'The unlock volume and seller-participation sliders decide how many tokens actually hit the market. Real unlocks never dump 100% - but even a fraction can crush a shallow pool.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i10-pool-selector"]',
      title: 'Choose the Battlefield',
      text: 'The pool depth decides how violent the crash is. A $1M pool absorbs a dump like a puddle absorbs a cinder block; the $20M pool at least slows the fall.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i10-impact"]',
      title: 'The Drawdown Meter',
      text: 'Projected price impact is your answer: pre-unlock vs post-dump price. This is pure AMM plumbing - the constant-product curve converting seller pressure into price.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i10-reset"]',
      title: 'Reset the Timeline',
      text: 'Reset to the standard medium-liquidity scenario and replay the experiment. Memo for real life: when cliffs and inflows collide, be on the right side of the exit door.',
      side: 'top' as const,
    },
  ];

  return (
    <div className="w-full max-w-lg space-y-5">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div data-tour="i10-lab-header" className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB I10 • CLIFF SELL PRESSURE SIMULATOR
          </Badge>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTourActive(true)}
              className="gap-1.5 text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent" /> Tour
            </Button>
            <Button
              data-tour="i10-reset"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">
          Token Cliff Unlock Simulator
        </h3>
        <p className="text-xs text-ink-soft">
          Simulate how sudden unlock events and holder dumps impact secondary market pool prices.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
            Lab Simulator
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            No real wallet · Nothing costs money
          </span>
        </div>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        {/* Controls */}
        <div data-tour="i10-controls" className="space-y-4">
          <Slider
            label="Cliff Unlock Volume"
            value={unlockAmount / 1_000_000}
            min={10}
            max={150}
            step={10}
            unit="M Tokens"
            onChange={(val) => setUnlockAmount(val * 1_000_000)}
          />

          <Slider
            label="Unlocked Tokens Sold Onto DEX"
            value={sellerPct}
            min={5}
            max={90}
            step={5}
            unit="%"
            onChange={setSellerPct}
          />

          {/* AMM Pool Depth Selector */}
          <div data-tour="i10-pool-selector" className="space-y-1.5">
            <label className="text-xs font-medium text-ink flex justify-between">
              <span>AMM Secondary Market Pool Liquidity:</span>
              <span className="text-primary font-mono">{currentPool.label}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['shallow', 'medium', 'deep'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setPoolDepthTier(tier)}
                  className={`py-2 px-3 text-xs font-heading font-semibold rounded-lg border transition-all ${
                    poolDepthTier === tier
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-bg text-ink-soft border-border hover:border-ink-soft'
                  }`}
                >
                  {tier === 'shallow' ? 'Thin Pool' : tier === 'medium' ? 'Standard' : 'Deep Pool'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Breakdown Cards */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-bg rounded-xl border border-border">
              <span className="text-[11px] text-ink-soft block">Tokens Dumped</span>
              <span className="text-base font-mono font-semibold text-ink">
                {(result.tokensDumped / 1_000_000).toFixed(1)}M Tokens
              </span>
              <span className="text-[10px] text-ink-soft block mt-0.5">
                {sellerPct}% of unlock
              </span>
            </div>

            <div className="p-3 bg-bg rounded-xl border border-border">
              <span className="text-[11px] text-ink-soft block">USD Extracted</span>
              <span className="text-base font-mono font-semibold text-accent">
                ${(result.usdExtracted / 1_000_000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-ink-soft block mt-0.5">
                Removed from pool reserves
              </span>
            </div>
          </div>

          {/* Drawdown Meter */}
          <div
            data-tour="i10-impact"
            className={`p-4 rounded-xl border space-y-2 ${
              result.priceDrawdownPct > 35
                ? 'bg-danger-light border-danger/40 text-red-950'
                : result.priceDrawdownPct > 15
                ? 'bg-warn-light border-warn/40 text-amber-950'
                : 'bg-accent-light/50 border-accent/40 text-emerald-950'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-medium text-xs">
                {result.priceDrawdownPct > 35 ? (
                  <ShieldAlert className="w-4 h-4 text-danger" />
                ) : (
                  <Activity className="w-4 h-4 text-primary" />
                )}
                <span>Projected Price Impact</span>
              </div>
              <span className="text-xl font-mono font-semibold">
                -{result.priceDrawdownPct.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between text-xs font-mono pt-1 border-t border-border/50">
              <span>Pre-Unlock: ${result.initialPrice.toFixed(4)}</span>
              <span>Post-Dump: ${result.postDumpPrice.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Model Disclaimer */}
        <div className="p-3.5 bg-bg rounded-xl border border-border text-[11px] text-ink-soft space-y-1">
          <div className="flex items-center gap-1 font-medium text-ink text-[11px]">
            <Info className="w-3.5 h-3.5 text-primary" /> Model of Pressure, Not a Price Forecast:
          </div>
          <p className="leading-relaxed">
            Real markets may see external buy-side limit orders, OTC sales, or hedging via perpetual futures. This simulator demonstrates pure spot AMM absorption mechanics.
          </p>
        </div>

        </Card>

      {/* What Just Happened? */}
      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            A {unlockAmount / 1_000_000}M-token cliff unlock with {sellerPct}% of holders selling hit the {currentPool.label} pool. The dump extracted ${(result.usdExtracted / 1_000_000).toFixed(2)}M and ground the price from ${result.initialPrice.toFixed(4)} to ${result.postDumpPrice.toFixed(4)} - a -{result.priceDrawdownPct.toFixed(1)}% hit. {result.priceDrawdownPct > 35 ? 'A crash this size cascades into liquidations and panic. Deeper pools are the only circuit breaker.' : result.priceDrawdownPct > 15 ? 'Serious damage, but the pool depth absorbed the worst of it.' : 'Noticeable pressure, yet deep absorption kept the scar small.'} Same unlock, deeper pool, smaller scar.
          </p>
        </div>
      </Card>
    </div>
  );
}
