'use client';

import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { evaluateTokenLaunch, LaunchParams, LaunchVerdict } from '@defi-mommy/sim-core';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Scale,
  Award,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface PresetCase {
  id: string;
  name: string;
  tagline: string;
  params: LaunchParams;
  targetVerdict: 'fair' | 'wait' | 'trap';
  summary: string;
}

const PRESET_CASES: PresetCase[] = [
  {
    id: 'nexus',
    name: 'Nexus Protocol ($NEX)',
    tagline: 'Hyper-hyped cross-chain DEX router with massive private VC backing.',
    params: {
      projectName: 'Nexus Protocol',
      ticker: 'NEX',
      fdvUSD: 1_200_000_000,
      initialFloatPct: 3.5,
      cliffMonths: 3,
      insiderSharePct: 65,
      annualRevenueUSD: 250_000,
      peerMedianFDVUSD: 80_000_000,
    },
    targetVerdict: 'trap',
    summary: 'A classic 2024 low-float / high-FDV trap. Only 3.5% circulating allows early manipulators to pump the price, but a $1.2B FDV (15x peers) and a tiny 3-month cliff will lead to catastrophic sell pressure.',
  },
  {
    id: 'solflow',
    name: 'SolFlow Router ($FLOW)',
    tagline: 'Community-led Solana liquidity optimizer with transparent vesting.',
    params: {
      projectName: 'SolFlow Router',
      ticker: 'FLOW',
      fdvUSD: 52_000_000,
      initialFloatPct: 26.0,
      cliffMonths: 12,
      insiderSharePct: 22,
      annualRevenueUSD: 1_800_000,
      peerMedianFDVUSD: 45_000_000,
    },
    targetVerdict: 'fair',
    summary: 'An exemplary sustainable launch. With 26% day-1 float, a reasonable 1.15x peer multiple, 1-year institutional cliff, and under 25% insider allocation, incentives are aligned with secondary holders.',
  },
  {
    id: 'hyperyield',
    name: 'HyperYield DEX ($HYP)',
    tagline: 'Solana yield aggregator with decent tech but expensive day-1 valuation.',
    params: {
      projectName: 'HyperYield DEX',
      ticker: 'HYP',
      fdvUSD: 380_000_000,
      initialFloatPct: 11.0,
      cliffMonths: 12,
      insiderSharePct: 38,
      annualRevenueUSD: 1_200_000,
      peerMedianFDVUSD: 100_000_000,
    },
    targetVerdict: 'wait',
    summary: 'Solid technology and a healthy 12-month cliff, but priced at nearly 4x established sector leaders. Experienced traders would wait for post-launch cooling and pre-cliff consolidation.',
  },
];

export function I11Companion() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('nexus');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Custom parameters
  const [customFdvM, setCustomFdvM] = useState<number>(250);
  const [customFloatPct, setCustomFloatPct] = useState<number>(10);
  const [customCliffMonths, setCustomCliffMonths] = useState<number>(6);
  const [customInsiderPct, setCustomInsiderPct] = useState<number>(45);
  const [customPeerFdvM, setCustomPeerFdvM] = useState<number>(80);

  // Interactive Game State
  const [userGuess, setUserGuess] = useState<'fair' | 'wait' | 'trap' | null>(null);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [solvedCases, setSolvedCases] = useState<Record<string, boolean>>({});

  // Active configuration
  const activeParams: LaunchParams = useMemo(() => {
    if (isCustomMode) {
      return {
        projectName: 'Custom Token Launch',
        ticker: 'CUST',
        fdvUSD: customFdvM * 1_000_000,
        initialFloatPct: customFloatPct,
        cliffMonths: customCliffMonths,
        insiderSharePct: customInsiderPct,
        annualRevenueUSD: 500_000,
        peerMedianFDVUSD: customPeerFdvM * 1_000_000,
      };
    }
    const found = PRESET_CASES.find((c) => c.id === selectedCaseId) || PRESET_CASES[0];
    return found.params;
  }, [
    isCustomMode,
    selectedCaseId,
    customFdvM,
    customFloatPct,
    customCliffMonths,
    customInsiderPct,
    customPeerFdvM,
  ]);

  const verdict: LaunchVerdict = useMemo(() => {
    return evaluateTokenLaunch(activeParams);
  }, [activeParams]);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setIsCustomMode(false);
    setUserGuess(null);
    setGameFeedback(null);
  };

  const handleCustomToggle = () => {
    setIsCustomMode(true);
    setUserGuess(null);
    setGameFeedback(null);
  };

  const handleGuessVerdict = (guess: 'fair' | 'wait' | 'trap') => {
    setUserGuess(guess);
    const isCorrect = guess === verdict.verdict;

    if (isCorrect) {
      setGameFeedback(`Correct Verdict! You accurately identified this launch as: "${verdict.verdictLabel}".`);
      if (!isCustomMode) {
        setSolvedCases((prev) => ({ ...prev, [selectedCaseId]: true }));
      }
    } else {
      setGameFeedback(
        `Not quite. The quantitative math grades this launch as "${verdict.verdictLabel}" (Score: ${verdict.score}/100) because of key structural imbalances.`
      );
    }
  };

  const solvedCount = Object.keys(solvedCases).length;

  return (
    <Card className="p-6 space-y-6 border border-border shadow-card bg-surface text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-xl text-ink">Judge the Launch Game</h2>
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Conduct due diligence on token launches using float %, peer relative comps, and lockup cliffs.
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

        <div className="flex items-center gap-2">
          <Badge
            variant={solvedCount === 3 ? 'accent' : 'outline'}
            className="text-xs font-mono font-bold px-2.5 py-1"
          >
            {solvedCount} / 3 Solved
          </Badge>
          {solvedCount === 3 && (
            <Badge variant="accent" className="text-xs font-medium gap-1 flex items-center">
              <Award className="w-3 h-3" />
              <span>Certified Scout</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESET_CASES.map((preset) => {
          const isSelected = !isCustomMode && selectedCaseId === preset.id;
          const isSolved = solvedCases[preset.id];
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectCase(preset.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary-light/50 font-medium shadow-xs'
                  : 'border-border bg-surface-raised hover:bg-bg'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="truncate">{preset.name.split(' ')[0]}</span>
                {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </div>
              <div className="text-[10px] text-ink-soft truncate mt-0.5">
                {preset.targetVerdict.toUpperCase()}
              </div>
            </button>
          );
        })}

        <button
          onClick={handleCustomToggle}
          className={`p-3 rounded-xl border text-left transition-all ${
            isCustomMode
              ? 'border-primary bg-primary-light/50 font-medium shadow-xs'
              : 'border-border bg-surface-raised hover:bg-bg'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span>Custom Sandbox</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary shrink-0" />
          </div>
          <div className="text-[10px] text-ink-soft truncate mt-0.5">Free-form sliders</div>
        </button>
      </div>

      {/* Case Description */}
      {!isCustomMode && (
        <div className="p-3.5 rounded-xl bg-bg border border-border space-y-1">
          <div className="text-xs font-medium text-ink">{activeParams.projectName} ({activeParams.ticker})</div>
          <div className="text-xs text-ink-soft">
            {PRESET_CASES.find((c) => c.id === selectedCaseId)?.tagline}
          </div>
        </div>
      )}

      {/* Custom Sliders (Only if Custom Sandbox selected) */}
      {isCustomMode && (
        <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-4">
          <div className="text-xs font-medium text-ink flex items-center justify-between">
            <span>Interactive Custom Launch Sliders</span>
            <span className="text-[10px] text-ink-soft">Adjust parameters to simulate any launch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Slider
                label="Day-1 Circulating Float"
                value={customFloatPct}
                min={1}
                max={50}
                step={1}
                unit="%"
                onChange={(val) => setCustomFloatPct(val)}
              />
            </div>

            <div className="space-y-1.5">
              <Slider
                label="Fully Diluted Valuation (FDV)"
                value={customFdvM}
                min={10}
                max={2000}
                step={10}
                unit="M"
                formatValue={(val) => `$${val}M`}
                onChange={(val) => setCustomFdvM(val)}
              />
            </div>

            <div className="space-y-1.5">
              <Slider
                label="Investor Cliff Lockup"
                value={customCliffMonths}
                min={0}
                max={24}
                step={1}
                unit=" mo"
                onChange={(val) => setCustomCliffMonths(val)}
              />
            </div>

            <div className="space-y-1.5">
              <Slider
                label="Sector Peer Median FDV"
                value={customPeerFdvM}
                min={10}
                max={500}
                step={5}
                unit="M"
                formatValue={(val) => `$${val}M`}
                onChange={(val) => setCustomPeerFdvM(val)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-bg border border-border">
          <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Initial Float</div>
          <div className="text-lg font-mono font-semibold text-ink mt-0.5">
            {activeParams.initialFloatPct}%
          </div>
          <div className="text-[10px] text-ink-soft mt-0.5">
            {activeParams.initialFloatPct >= 15 ? 'Sufficient' : 'Low / Risky'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-bg border border-border">
          <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Launch FDV</div>
          <div className="text-lg font-mono font-semibold text-ink mt-0.5">
            ${(activeParams.fdvUSD / 1e6).toFixed(0)}M
          </div>
          <div className="text-[10px] text-ink-soft mt-0.5">
            MCap: ${((activeParams.fdvUSD * activeParams.initialFloatPct) / 1e8).toFixed(1)}M
          </div>
        </div>

        <div className="p-3 rounded-xl bg-bg border border-border">
          <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Peer Multiple</div>
          <div className="text-lg font-mono font-semibold text-ink mt-0.5">
            {verdict.fdvToPeerRatio.toFixed(1)}x
          </div>
          <div className="text-[10px] text-ink-soft mt-0.5">
            vs ${(activeParams.peerMedianFDVUSD / 1e6).toFixed(0)}M peer
          </div>
        </div>

        <div className="p-3 rounded-xl bg-bg border border-border">
          <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Investor Cliff</div>
          <div className="text-lg font-mono font-semibold text-ink mt-0.5">
            {activeParams.cliffMonths} Mos
          </div>
          <div className="text-[10px] text-ink-soft mt-0.5">
            {activeParams.cliffMonths >= 12 ? 'Standard' : 'Short lock'}
          </div>
        </div>
      </div>

      {/* Interactive Verdict Game Buttons */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary-light/20 space-y-3">
        <div className="text-xs font-medium text-ink flex items-center justify-between">
          <span>What is your verdict on this launch?</span>
          <span className="text-[10px] text-ink-soft">Select your rating based on the metrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Button
            variant={userGuess === 'fair' ? 'primary' : 'secondary'}
            onClick={() => handleGuessVerdict('fair')}
            className="w-full text-xs font-medium gap-2 py-3"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Fair & Aligned</span>
          </Button>

          <Button
            variant={userGuess === 'wait' ? 'primary' : 'secondary'}
            onClick={() => handleGuessVerdict('wait')}
            className="w-full text-xs font-medium gap-2 py-3"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Overvalued (Wait)</span>
          </Button>

          <Button
            variant={userGuess === 'trap' ? 'primary' : 'secondary'}
            onClick={() => handleGuessVerdict('trap')}
            className="w-full text-xs font-medium gap-2 py-3"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Predatory Trap</span>
          </Button>
        </div>

        {gameFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
              userGuess === verdict.verdict
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-900'
            }`}
          >
            {gameFeedback}
          </div>
        )}
      </div>

      {/* 4-Pillar Due Diligence Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-ink-soft">
            4-Pillar Due Diligence Checklist
          </h3>
          <div className="text-xs font-mono font-semibold">
            Health Score: <span className={verdict.score >= 70 ? 'text-emerald-600' : verdict.score >= 45 ? 'text-amber-600' : 'text-rose-600'}>{verdict.score} / 100</span>
          </div>
        </div>

        <div className="space-y-2">
          {verdict.checklist.map((item: any) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                item.passed
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-rose-500/20 bg-rose-500/5'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{item.name}</span>
                  <span className="font-mono text-[11px] font-semibold text-ink-soft">
                    {item.actual} (Req: {item.benchmark})
                  </span>
                </div>
                <div className="text-[11px] text-ink-soft leading-relaxed">
                  {item.feedback}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Rationale */}
      {!isCustomMode && (
        <div className="p-3.5 rounded-xl bg-bg border border-border space-y-1 text-xs">
          <div className="font-medium text-ink">Scout Briefing Summary:</div>
          <div className="text-ink-soft leading-relaxed">
            {PRESET_CASES.find((c) => c.id === selectedCaseId)?.summary}
          </div>
        </div>
      )}
    </Card>
  );
}
