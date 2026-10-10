'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { getMarketCap, getFDV, getFloatPct } from '@defi-mommy/sim-core';
import { PieChart, AlertTriangle, HelpCircle, RotateCcw } from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function B8Companion() {
  const [price, setPrice] = useState(2.5);
  const [circulating, setCirculating] = useState(10); // Millions
  const [total, setTotal] = useState(100); // Millions
  const [isTourActive, setIsTourActive] = useState(false);

  const marketCap = getMarketCap(price, circulating * 1_000_000);
  const fdv = getFDV(price, total * 1_000_000);
  const floatPct = getFloatPct(circulating * 1_000_000, total * 1_000_000);

  const tourSteps = [
    {
      target: '[data-tour="b8-controls"]',
      title: 'Shape The Token',
      text: 'Three inputs, one valuation. Drag unit price, then change how much supply is circulating versus the maximum the team can ever mint.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="b8-readouts"]',
      title: 'Market Cap vs FDV',
      text: 'Market cap uses circulating supply. FDV prices every token at once, including locked team and investor allocations you can never buy today.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="b8-float"]',
      title: 'The Float Gauge',
      text: 'If float is low, a huge share of supply is still locked. That is a future sell wall waiting to dump on early buyers.',
      side: 'top' as const,
    },
  ];

  const handleReset = () => {
    setPrice(2.5);
    setCirculating(10);
    setTotal(100);
  };

  return (
    <div className="w-full max-w-lg space-y-5">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="primary" className="mb-1">
            INTERACTIVE LAB: B8
          </Badge>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTourActive(true)}
              className="gap-1.5 text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent" /> Spotlight Tour
            </Button>
            <Button
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
          Market Cap & FDV Simulator
        </h3>
        <p className="text-xs text-ink-soft">
          Test how token price, supply, and circulating float shape valuations.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
            Sandbox
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            No real wallet · Nothing costs money
          </span>
        </div>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div data-tour="b8-controls" className="space-y-4">
          <Slider
            label="Token Unit Price ($)"
            value={price}
            min={0.1}
            max={20}
            step={0.1}
            formatValue={(v) => `$${v.toFixed(2)}`}
            onChange={setPrice}
          />

          <Slider
            label="Circulating Supply (Millions)"
            value={circulating}
            min={1}
            max={total}
            step={1}
            unit="M"
            onChange={setCirculating}
          />

          <Slider
            label="Total / Max Supply (Millions)"
            value={total}
            min={circulating}
            max={500}
            step={5}
            unit="M"
            onChange={setTotal}
          />
        </div>

        {/* Readouts */}
        <div data-tour="b8-readouts" className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div className="p-3.5 bg-bg rounded-xl border border-border">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">
              Market Cap
            </span>
            <span className="font-mono font-semibold text-base text-primary">
              ${(marketCap / 1_000_000).toFixed(2)}M
            </span>
          </div>

          <div className="p-3.5 bg-bg rounded-xl border border-border">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">
              FDV (Fully Diluted)
            </span>
            <span className="font-mono font-semibold text-base text-ink">
              ${(fdv / 1_000_000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Float Gauge */}
        <div data-tour="b8-float" className="p-3.5 rounded-xl bg-primary-light/30 border border-primary/20 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-ink">Circulating Float:</span>
            <span className="font-mono font-semibold text-primary">
              {(floatPct * 100).toFixed(1)}% of total supply
            </span>
          </div>

          <div className="w-full bg-border h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${floatPct * 100}%` }}
            />
          </div>

          {floatPct < 0.2 && (
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] pt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Low Float Alert: Over 80% of supply is waiting to unlock!</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
