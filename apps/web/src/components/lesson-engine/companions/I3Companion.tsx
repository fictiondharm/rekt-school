'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { simulateUserDilution, getAPY } from '@defi-mommy/sim-core';
import { Users, TrendingDown, RotateCcw, Zap, HelpCircle, CheckCircle2 } from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function I3Companion() {
  const [userCount, setUserCount] = useState(1);
  const [isTourActive, setIsTourActive] = useState(false);
  const initialTVL = 10000;
  const initialAPR = 1.0; // 100% launch APR

  // Simulate dilution
  const { newTVL, newAPR, dilutionPct } = simulateUserDilution(
    initialTVL,
    initialAPR,
    userCount - 1,
    2000
  );

  const apy = getAPY(newAPR, 365);

  const tourSteps = [
    {
      target: '[data-tour="i3-lab-header"]',
      title: 'Welcome to the Yield Lab',
      text: 'This right-hand panel is the dilution simulator behind the lesson. Every launch APR you see on DEXes comes with hidden math - and this lab makes the math visible.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i3-metrics"]',
      title: 'Users In, TVL Up',
      text: 'Each depositor adds $2,000 to the pool. Watch the Active Depositors and Pool TVL counters climb together - more users means more capital splitting the same reward pie.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i3-rate-gauges"]',
      title: 'The APR Collapse Machine',
      text: 'This is the star: your APR. A 100% launch rate sounds amazing until even 20 extra users dilute it. Compounded APY is what you actually earn if you leave money in - always compare APY, not launch APR.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i3-action-buttons"]',
      title: 'Add Users, Watch It Fall',
      text: 'Hit +20 Users or +100 Users to simulate the crowd flooding in. The dilution arrow below the APR shows exactly how much of your yield evaporated because the reward pool got split more ways.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i3-reset"]',
      title: 'Reset and Re-Explore',
      text: 'Reset to Day 1 whenever you want to re-run the experiment. Astronomy-level launch APRs are always a temporary trap - this lab is how you prove it instead of trusting a tweet.',
      side: 'top' as const,
    },
  ];

  const handleAddUsers = (count: number) => {
    setUserCount((prev) => prev + count);
  };

  const handleReset = () => {
    setUserCount(1);
  };

  return (
    <div className="w-full max-w-lg space-y-5">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div data-tour="i3-lab-header" className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            INTERACTIVE LAB: I3 (WOW SIMULATOR)
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
              data-tour="i3-reset"
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
          The Yield Lab: Dilution in Action
        </h3>
        <p className="text-xs text-ink-soft">
          Click "Add 100 Users" to see why astronomical launch APRs mathematically collapse.
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
        {/* Metric Badges */}
        <div data-tour="i3-metrics" className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">
              Active Depositors
            </span>
            <span className="font-mono font-semibold text-xl text-ink">
              {userCount} users
            </span>
          </div>

          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">
              Pool TVL
            </span>
            <span className="font-mono font-semibold text-xl text-primary">
              ${newTVL.toLocaleString()}
            </span>
          </div>
        </div>

        {/* APR & APY Gauges */}
        <div data-tour="i3-rate-gauges" className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink">Current APR:</span>
            <span
              className={`font-mono font-semibold text-2xl ${
                newAPR > 0.5 ? 'text-primary' : 'text-amber-700'
              }`}
            >
              {(newAPR * 100).toFixed(1)}%
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Compounded APY (Daily):</span>
            <span className="font-mono font-semibold text-ink">
              {(apy * 100).toFixed(1)}%
            </span>
          </div>

          {dilutionPct > 0.1 && (
            <div className="pt-2 border-t border-primary/20 flex items-center justify-between text-xs text-red-700">
              <span className="flex items-center gap-1 font-semibold">
                <TrendingDown className="w-4 h-4" /> Dilution from Launch:
              </span>
              <span className="font-mono font-semibold">
                -{(dilutionPct * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div data-tour="i3-action-buttons" className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            onClick={() => handleAddUsers(20)}
            className="gap-1.5 text-xs"
          >
            <Users className="w-3.5 h-3.5" /> +20 Users
          </Button>

          <Button
            variant="accent"
            onClick={() => handleAddUsers(100)}
            className="gap-1.5 text-xs"
          >
            <Zap className="w-3.5 h-3.5" /> +100 Users (Collapse APR)
          </Button>
        </div>

        </Card>

      {/* What Just Happened? */}
      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {userCount === 1
              ? 'You are the only depositor, so you "earn" the full 100% launch APR. It looks astronomical because the reward pie currently has one fork in it.'
              : userCount <= 20
              ? `${userCount} depositors now split the fixed reward pool. Your APR fell from 100% to ${(newAPR * 100).toFixed(1)}%. Nobody stole anything - the pie did not grow, it just went from 1 fork to ${userCount}.`
              : `${userCount} depositors flooded in and the reward pool gets split more ways every minute. TVL ballooned to $${newTVL.toLocaleString()}, so your slice of emissions collapsed by ${(dilutionPct * 100).toFixed(1)}%. Launch APRs above 50% are always a race against the clock.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
