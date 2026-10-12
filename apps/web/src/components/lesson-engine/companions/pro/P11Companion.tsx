'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, CheckCircle2, AlertTriangle, Skull, TrendingUp } from 'lucide-react';

const BETS = 20;

export function P11Companion() {
  const [winRate, setWinRate] = useState(55);
  const [payoffRatio, setPayoffRatio] = useState(1.5);
  const [riskPct, setRiskPct] = useState(10);

  const handleReset = () => {
    setWinRate(55);
    setPayoffRatio(1.5);
    setRiskPct(10);
  };

  const W = winRate / 100;
  const kelly = W - (1 - W) / payoffRatio; // fraction of capital
  const risk = riskPct / 100;

  // Deterministic win/loss sequence over BETS roughly matching the win rate.
  const seq: boolean[] = Array.from({ length: BETS }, (_, i) => ((i * 37) % 100) < winRate * 100);

  let equity = 1;
  let peak = 1;
  let maxDD = 0;
  const path: number[] = [1];
  for (const win of seq) {
    equity *= win ? 1 + risk * payoffRatio : 1 - risk;
    peak = Math.max(peak, equity);
    maxDD = Math.max(maxDD, 1 - equity / peak);
    path.push(equity);
  }
  const finalEquity = equity;
  const ruined = finalEquity < 0.01; // lost ~99%+ of capital

  const verdict =
    kelly <= 0
      ? { label: 'NO EDGE', variant: 'danger' as const, text: 'Kelly is zero or negative: this bet has no positive edge. Any sizing is a slow leak.' }
      : risk > kelly
      ? { label: 'OVER-BETTING', variant: 'danger' as const, text: 'You are risking more than full Kelly. Variance explodes and a normal losing streak can wipe you out.' }
      : risk > kelly * 0.5
      ? { label: 'NEAR FULL KELLY', variant: 'warn' as const, text: 'Close to full Kelly - high growth but brutal drawdowns. Most practitioners stay below half.' }
      : { label: 'CONSERVATIVE', variant: 'accent' as const, text: 'Well under half-Kelly. Slower growth, but far more survivable drawdowns.' };

  const minPath = Math.min(...path, 1);
  const maxPath = Math.max(...path, 1);

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1" data-tour="p11-head">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P11 &bull; POSITION SIZING
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Kelly Criterion &amp; Ruin</h3>
        <p className="text-xs text-ink-soft">
          Same edge, different bet sizes: growth or ruin. Run 20 bets and see which.
        </p>
      </div>

      <Card data-tour="p11-lab" className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <Slider
          label="Win Rate"
          value={winRate}
          min={30}
          max={75}
          step={1}
          formatValue={(v) => `${v}%`}
          onChange={setWinRate}
        />
        <Slider
          label="Payoff Ratio (win ÷ loss)"
          value={payoffRatio}
          min={0.5}
          max={3}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}:1`}
          onChange={setPayoffRatio}
        />
        <Slider
          label="Your Risk Per Bet"
          value={riskPct}
          min={1}
          max={50}
          step={1}
          formatValue={(v) => `${v}%`}
          onChange={setRiskPct}
        />

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Full Kelly</span>
            <span className="font-mono font-semibold text-lg text-primary">
              {kelly > 0 ? `${(kelly * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="p-3 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Half Kelly</span>
            <span className="font-mono font-semibold text-lg text-ink">
              {kelly > 0 ? `${(kelly * 50).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="p-3 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">You Risk</span>
            <span className={`font-mono font-semibold text-lg ${risk > kelly && kelly > 0 ? 'text-red-600' : 'text-ink'}`}>
              {riskPct}%
            </span>
          </div>
        </div>

        {/* Equity curve */}
        <div className="p-4 rounded-xl bg-bg border border-border space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">
            20-bet equity curve (start = 1.0×)
          </span>
          <div className="relative h-20">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <line x1="0" y1={100 - ((1 - minPath) / Math.max(0.001, maxPath - minPath)) * 100} x2="100"
                y2={100 - ((1 - minPath) / Math.max(0.001, maxPath - minPath)) * 100}
                stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3 3" />
              <polyline
                points={path
                  .map((e, i) => {
                    const x = (i / (BETS)) * 100;
                    const y = 100 - ((e - minPath) / Math.max(0.001, maxPath - minPath)) * 100;
                    return `${x},${Math.max(0, Math.min(100, y))}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={ruined ? '#ef4444' : '#16a34a'}
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-ink-soft">
            <span>bet 1</span>
            <span>max drawdown {(maxDD * 100).toFixed(0)}%</span>
            <span>bet {BETS}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border-2 space-y-2 ${
            ruined ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink">Final Capital</span>
            <span className={`font-mono font-semibold text-2xl ${ruined ? 'text-red-600' : 'text-emerald-600'}`}>
              {ruined ? '$0 (RUINED)' : `${finalEquity.toFixed(2)}×`}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Max drawdown reached</span>
            <span className="font-mono font-semibold text-ink">{(maxDD * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Gain needed to recover that DD</span>
            <span className="font-mono font-semibold text-ink">
              {maxDD >= 0.999 ? '∞ (unrecoverable)' : `+${((maxDD / (1 - maxDD)) * 100).toFixed(0)}%`}
            </span>
          </div>
          <div className="pt-1">
            <Badge variant={verdict.variant} className="text-[10px]">
              {verdict.label}
            </Badge>
          </div>
        </div>
      </Card>

      <Card data-tour="p11-explainer" className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {ruined ? (
          <Skull className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        ) : risk > kelly && kelly > 0 ? (
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            Your edge (${winRate}% at ${payoffRatio.toFixed(1)}:1) defines a full-Kelly size of{' '}
            {kelly > 0 ? `${(kelly * 100).toFixed(0)}%` : '0% (no edge)'}. {verdict.text}{' '}
            {ruined
              ? `By risking ${riskPct}% per bet you hit a drawdown of ${(maxDD * 100).toFixed(0)}% and could not recover - ruin is absorbing, and over-betting got you there despite a positive edge.`
              : `At ${riskPct}% per bet the 20-bet path ended at ${finalEquity.toFixed(2)}× with a max drawdown of ${(maxDD * 100).toFixed(0)}%. Note that a ${(maxDD * 100).toFixed(0)}% drawdown would need a +${((maxDD / (1 - maxDD)) * 100).toFixed(0)}% gain just to get back to even - which is why the goal is to still be playing.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
