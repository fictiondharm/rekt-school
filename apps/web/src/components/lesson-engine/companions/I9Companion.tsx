'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import {
  evaluateTokenomicsHealth,
  calculateSupplyAtMonth,
  TokenomicsConfig,
} from '@defi-mommy/sim-core';
import {
  PieChart,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Info,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function I9Companion() {
  const [teamAlloc, setTeamAlloc] = useState(20);
  const [vcAlloc, setVcAlloc] = useState(20);
  const [airdropAlloc, setAirdropAlloc] = useState(15);
  const [teamCliffMonths, setTeamCliffMonths] = useState(12);
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [isTourActive, setIsTourActive] = useState(false);

  // Compute remaining for Community
  const communityAlloc = Math.max(0, 100 - teamAlloc - vcAlloc - airdropAlloc);

  const config: TokenomicsConfig = {
    totalSupply: 1_000_000_000,
    initialPriceUSD: 0.25,
    allocations: [
      {
        name: 'Community Ecosystem',
        percentage: communityAlloc,
        cliffMonths: 0,
        vestingMonths: 48,
        initialUnlockPct: 15,
        isInsider: false,
      },
      {
        name: 'Core Contributors',
        percentage: teamAlloc,
        cliffMonths: teamCliffMonths,
        vestingMonths: 36,
        initialUnlockPct: 0,
        isInsider: true,
      },
      {
        name: 'Early Investors',
        percentage: vcAlloc,
        cliffMonths: 12,
        vestingMonths: 24,
        initialUnlockPct: 0,
        isInsider: true,
      },
      {
        name: 'Public Airdrop & DEX',
        percentage: airdropAlloc,
        cliffMonths: 0,
        vestingMonths: 0,
        initialUnlockPct: 100,
        isInsider: false,
      },
    ],
  };

  const health = evaluateTokenomicsHealth(config);
  const supplyData = calculateSupplyAtMonth(config, selectedMonth);

  const handleReset = () => {
    setTeamAlloc(20);
    setVcAlloc(20);
    setAirdropAlloc(15);
    setTeamCliffMonths(12);
    setSelectedMonth(6);
  };

  const tourSteps = [
    {
      target: '[data-tour="i9-lab-header"]',
      title: 'Welcome, Token Architect',
      text: 'This panel is where you design a token launch and see it graded. The allocation you pick now silently determines how many insiders can dump on you later.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i9-allocations"]',
      title: 'Slice the Pie',
      text: 'These four sliders split the supply: team, VCs, airdrop - and whatever remains flows to the community treasury. Watch the counter keep every percentage honest.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i9-alloc-bar"]',
      title: 'The Supply Bar',
      text: 'This bar is the whole token at a glance. Colored segments show who controls what. The danger zone: millions of unlocked tokens held by people who paid fractions of the public price.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i9-health"]',
      title: 'Your Health Score',
      text: 'The lab grades your design out of 100 based on insider control and day-0 float. Red flags list exactly which allocation choices are hurting it and why.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i9-month-inspector"]',
      title: 'Inspect the Timelines',
      text: 'Slide through months to see circulating supply grow as cliffs and vesting unlock. This timeline is the exact tool sharp traders use to price in future sell pressure.',
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

      <div data-tour="i9-lab-header" className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB I9 • TOKENOMICS ARCHITECT
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
              data-tour="i9-reset"
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
          Tokenomics & Vesting Lab
        </h3>
        <p className="text-xs text-ink-soft">
          Configure supply distribution, inspect insider control, and test against predatory unlock models.
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
        {/* Allocations Sliders */}
        <div data-tour="i9-allocations" className="space-y-4">
          <Slider
            label="Core Team & Founders Allocation"
            value={teamAlloc}
            min={5}
            max={50}
            step={5}
            unit="%"
            onChange={setTeamAlloc}
          />

          <Slider
            label="Seed VCs & Private Investors"
            value={vcAlloc}
            min={0}
            max={50}
            step={5}
            unit="%"
            onChange={setVcAlloc}
          />

          <Slider
            label="Public Airdrop & Immediate Liquidity"
            value={airdropAlloc}
            min={5}
            max={40}
            step={5}
            unit="%"
            onChange={setAirdropAlloc}
          />

          <Slider
            label="Team Cliff Lockup Duration"
            value={teamCliffMonths}
            min={0}
            max={24}
            step={6}
            unit="Months"
            onChange={setTeamCliffMonths}
          />

          <div className="flex justify-between items-center text-xs p-2.5 bg-bg rounded-lg border border-border">
            <span className="text-ink-soft">Remaining to Community Treasury:</span>
            <span className="font-mono font-semibold text-accent">{communityAlloc}%</span>
          </div>
        </div>

        {/* Visual Allocation Breakdown Bar */}
        <div data-tour="i9-alloc-bar" className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-ink-soft">Token Allocation Distribution:</span>
            <span>100% Total</span>
          </div>
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-border">
            <div
              style={{ width: `${communityAlloc}%` }}
              className="bg-emerald-500 h-full"
              title={`Community: ${communityAlloc}%`}
            />
            <div
              style={{ width: `${teamAlloc}%` }}
              className="bg-amber-500 h-full"
              title={`Team: ${teamAlloc}%`}
            />
            <div
              style={{ width: `${vcAlloc}%` }}
              className="bg-rose-500 h-full"
              title={`VCs: ${vcAlloc}%`}
            />
            <div
              style={{ width: `${airdropAlloc}%` }}
              className="bg-indigo-500 h-full"
              title={`Airdrop: ${airdropAlloc}%`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-ink-soft pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Community
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Team
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> VCs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Airdrop
            </span>
          </div>
        </div>

        {/* Health Score Card */}
        <div
          data-tour="i9-health"
          className={`p-4 rounded-xl border space-y-2 ${
            health.isHealthy
              ? 'bg-accent-light/50 border-accent/40 text-emerald-950'
              : 'bg-danger-light border-danger/40 text-red-950'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 font-heading font-semibold text-sm">
              {health.isHealthy ? (
                <ShieldCheck className="w-5 h-5 text-accent" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-danger" />
              )}
              <span>Tokenomics Health Score</span>
            </div>
            <span className="font-mono font-semibold text-xl">
              {health.score}/100
            </span>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Total Insider Control (Team + VCs):</span>
              <span className="font-mono font-semibold">
                {health.insiderAllocationPct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Initial Day-0 Float:</span>
              <span className="font-mono font-semibold">
                {health.initialFloatPct.toFixed(1)}%
              </span>
            </div>
          </div>

          {health.redFlags.length > 0 && (
            <div className="pt-2 border-t border-danger/20 space-y-1">
              {health.redFlags.map((flag: string, i: number) => (
                <div key={i} className="text-[11px] font-semibold text-danger flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Month Inspector */}
        <div data-tour="i9-month-inspector" className="space-y-3 pt-1">
          <Slider
            label="Inspect Unlocked Supply At Timeline"
            value={selectedMonth}
            min={0}
            max={36}
            step={3}
            unit="Months"
            onChange={setSelectedMonth}
          />

          <div className="p-3 bg-bg rounded-xl border border-border flex justify-between items-center text-xs">
            <div>
              <span className="text-ink-soft block">Circulating Supply at Month {selectedMonth}</span>
              <span className="font-heading font-semibold text-sm text-ink">
                {(supplyData.circulatingSupply / 1_000_000).toFixed(1)}M Tokens
              </span>
            </div>
            <div className="text-right">
              <span className="text-ink-soft block">Circulating Float</span>
              <span className="font-mono font-semibold text-primary">
                {supplyData.circulatingPct.toFixed(1)}% of Total
              </span>
            </div>
          </div>
        </div>

        </Card>

      {/* What Just Happened? */}
      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            Your design scores {health.score}/100: insiders (team + VCs) control {health.insiderAllocationPct}% and only {health.initialFloatPct.toFixed(1)}% floats on day 0. {health.redFlags.length > 0 ? health.redFlags[0] : 'No red flags - public float is meaningful and insider control is contained.'} By month {selectedMonth}, {supplyData.circulatingPct.toFixed(1)}% of all tokens circulate, so any unlock after this point meets the open market directly.
          </p>
        </div>
      </Card>
    </div>
  );
}
