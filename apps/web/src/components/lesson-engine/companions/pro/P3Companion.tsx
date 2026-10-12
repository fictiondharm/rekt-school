'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, CheckCircle2, Skull, TrendingUp, TrendingDown } from 'lucide-react';

const ENTRY = 100;
const MARGIN = 100;

export function P3Companion() {
  const [leverage, setLeverage] = useState(10);
  const [movePct, setMovePct] = useState(-8);
  const [direction, setDirection] = useState<'long' | 'short'>('long');

  const handleReset = () => {
    setLeverage(10);
    setMovePct(-8);
    setDirection('long');
  };

  const positionSize = MARGIN * leverage;
  const price = ENTRY * (1 + movePct / 100);
  const dir = direction === 'long' ? 1 : -1;
  const pnl = ((movePct / 100) * positionSize) * dir;
  const roe = (pnl / MARGIN) * 100;
  const liqPrice = direction === 'long' ? ENTRY * (1 - 1 / leverage) : ENTRY * (1 + 1 / leverage);
  const liquidated = direction === 'long' ? price <= liqPrice : price >= liqPrice;
  const liqDistancePct = (Math.abs(ENTRY - liqPrice) / ENTRY) * 100;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1" data-tour="p3-head">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P3 &bull; 1x–20x PERPS
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Leverage &amp; Liquidation</h3>
        <p className="text-xs text-ink-soft">
          $100 margin, entry $100. Drag leverage and the price move to find the liquidation line.
        </p>
      </div>

      <Card data-tour="p3-lab" className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setDirection('long')}
            className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
              direction === 'long'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Long
          </button>
          <button
            type="button"
            onClick={() => setDirection('short')}
            className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
              direction === 'short'
                ? 'bg-red-50 border-red-400 text-red-700 font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" /> Short
          </button>
        </div>

        <Slider
          label="Leverage"
          value={leverage}
          min={1}
          max={20}
          step={1}
          formatValue={(v) => `${v}×`}
          onChange={setLeverage}
        />
        <Slider
          label="Price Move"
          value={movePct}
          min={-30}
          max={30}
          step={1}
          formatValue={(v) => `${v}%`}
          onChange={setMovePct}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Position Size</span>
            <span className="font-mono font-semibold text-xl text-ink">${positionSize.toLocaleString()}</span>
          </div>
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Price Now</span>
            <span className="font-mono font-semibold text-xl text-ink">${price.toFixed(2)}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border-2 space-y-2 ${
            liquidated ? 'bg-red-50 border-red-300' : 'bg-primary-light/30 border-primary/20'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink">
              {liquidated ? 'Liquidated' : 'Unrealized PnL'}
            </span>
            <span
              className={`font-mono font-semibold text-2xl ${
                liquidated ? 'text-red-600' : pnl >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {liquidated ? `-$${MARGIN}` : `${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(0)}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Return on equity (ROE)</span>
            <span className="font-mono font-semibold text-ink">
              {liquidated ? '-100%' : `${roe >= 0 ? '+' : ''}${roe.toFixed(0)}%`}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Liquidation price</span>
            <span className="font-mono font-semibold text-ink">${liqPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Liquidation proximity bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-ink-soft">
            <span>liq ${liqPrice.toFixed(1)}</span>
            <span>entry $100</span>
          </div>
          <div className="h-3 rounded-full bg-border/60 overflow-hidden">
            <div
              className={`h-full ${liquidated ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{
                width: `${Math.max(2, Math.min(100, ((price - liqPrice) / (ENTRY - liqPrice)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-ink-soft text-center">
            Only {liqDistancePct.toFixed(1)}% from entry to liquidation at {leverage}×.
          </p>
        </div>
      </Card>

      <Card data-tour="p3-explainer" className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {liquidated ? (
          <Skull className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {liquidated
              ? `A ${Math.abs(movePct)}% move against your ${direction} at ${leverage}× equals ${(Math.abs(movePct) * leverage).toFixed(0)}% of your equity - past 100%, so the engine force-closed the position. Your $100 margin is gone. At ${leverage}×, liquidation sat just ${liqDistancePct.toFixed(1)}% from entry, so an ordinary market wiggle was enough.`
              : `Your ${direction} at ${leverage}× controls $${positionSize.toLocaleString()}. A ${movePct}% move produced ${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toFixed(0)} of PnL - a ${roe >= 0 ? '+' : ''}${roe.toFixed(0)}% return on your $100 equity, because leverage multiplies the percentage move. You are still ${liqDistancePct.toFixed(1)}% away from the liquidation line at $${liqPrice.toFixed(2)}.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
