'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, CheckCircle2, AlertTriangle, Target } from 'lucide-react';

export function P7Companion() {
  const [capital, setCapital] = useState(10000);
  const [rangeWidth, setRangeWidth] = useState(10); // % wide, centered on price
  const [movePct, setMovePct] = useState(6);

  const handleReset = () => {
    setCapital(10000);
    setRangeWidth(10);
    setMovePct(6);
  };

  const inRange = Math.abs(movePct) <= rangeWidth / 2;
  // Rough capital-efficiency multiple: narrower range = denser liquidity.
  const efficiency = Math.max(1, Math.min(200, 100 / rangeWidth));
  // Fee APR proxy: base fee rate scaled by how dense your liquidity is.
  const feeAPR = inRange ? Math.min(300, efficiency * 12) : 0;
  // Full-range impermanent loss for reference.
  const r = 1 + movePct / 100;
  const ilFullRange = (2 * Math.sqrt(r) / (1 + r) - 1) * 100; // negative
  // Out-of-range positions are 100% one token; penalize IL further.
  const ilPct = inRange ? ilFullRange : ilFullRange * 1.6;
  const netValue = capital * (1 + (feeAPR / 100) + ilPct / 100);

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P7 &bull; CONCENTRATED RANGE
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Tick Range &amp; Efficiency</h3>
        <p className="text-xs text-ink-soft">
          Pack liquidity into a narrow band, then move the price out of it.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <Slider
          label="Your Capital"
          value={capital}
          min={1000}
          max={100000}
          step={1000}
          formatValue={(v) => `$${v.toLocaleString()}`}
          onChange={setCapital}
        />
        <Slider
          label="Range Width (centered on price)"
          value={rangeWidth}
          min={1}
          max={100}
          step={1}
          formatValue={(v) => `${v}%`}
          onChange={setRangeWidth}
          helperText="Narrow = dense = high fees & high risk"
        />
        <Slider
          label="Price Move Since Deposit"
          value={movePct}
          min={-60}
          max={60}
          step={1}
          formatValue={(v) => `${v}%`}
          onChange={setMovePct}
        />

        {/* Range bar */}
        <div className="space-y-1.5">
          <div className="relative h-6 rounded-lg bg-border/40 overflow-hidden">
            <div
              className="absolute inset-y-0 bg-accent/25 border-x-2 border-accent"
              style={{
                left: `${50 - rangeWidth / 2}%`,
                width: `${rangeWidth}%`,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-ink"
              style={{ left: `${Math.max(0, Math.min(100, 50 + movePct))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-ink-soft">
            <span>-50%</span>
            <span className={inRange ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
              {inRange ? 'price IN range' : 'price OUT of range'}
            </span>
            <span>+50%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Capital Efficiency</span>
            <span className="font-mono font-semibold text-xl text-primary">{efficiency.toFixed(1)}×</span>
          </div>
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Fee APR</span>
            <span className={`font-mono font-semibold text-xl ${inRange ? 'text-emerald-600' : 'text-red-600'}`}>
              {feeAPR.toFixed(1)}%
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border-2 space-y-2 ${
            inRange ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Position Value
            </span>
            <span className={`font-mono font-semibold text-2xl ${inRange ? 'text-emerald-600' : 'text-red-600'}`}>
              ${netValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Impermanent loss vs holding</span>
            <span className="font-mono font-semibold text-red-600">{ilPct.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Composition</span>
            <span className="font-mono font-semibold text-ink">
              {inRange ? 'both tokens' : movePct > 0 ? '100% weak token' : '100% strong token'}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {inRange ? (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {inRange
              ? `Price stayed inside your ${rangeWidth}% band, so your liquidity is active and dense - roughly ${efficiency.toFixed(1)}× more fee-share than a full-range LP on the same capital. But note the impermanent loss of ${ilPct.toFixed(2)}% already accruing as the ratio drifts: concentration amplifies BOTH sides of the trade.`
              : `Price moved ${movePct}% and left your ${rangeWidth}% band, so your position stopped earning fees entirely (fee APR → 0%) and collapsed into ~100% of ${movePct > 0 ? 'the token that fell (you missed the up-move)' : 'the token that pumped (you are fully in the strong side)'}. This is the classic out-of-range freeze: you chased high APR in a tight band and are now sitting in a lopsided, non-earning position.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
