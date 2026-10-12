'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, ShieldCheck, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export function P6Companion() {
  const [tradeSize, setTradeSize] = useState(50000);
  const [depth, setDepth] = useState(400000);
  const [slippage, setSlippage] = useState(2); // %
  const [protectedRoute, setProtectedRoute] = useState(false);

  const handleReset = () => {
    setTradeSize(50000);
    setDepth(400000);
    setSlippage(2);
    setProtectedRoute(false);
  };

  const priceImpactPct = (tradeSize / depth) * 100;
  // The bot pushes price by as much as it can while you still fill = your tolerance,
  // but it cannot extract more than the impact your own order creates.
  const extractablePct = Math.min(slippage, priceImpactPct);
  const botProfit = protectedRoute ? 0 : tradeSize * (extractablePct / 100);
  const yourWorseFill = protectedRoute ? 0 : extractablePct;
  const wouldRevert = protectedRoute && priceImpactPct > slippage;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1" data-tour="p6-head">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P6 &bull; SANDWICH DEFENSE
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Sandwich Bot Lab</h3>
        <p className="text-xs text-ink-soft">
          Your swap is public. Watch a bot front-run and back-run it - then hide from it.
        </p>
      </div>

      <Card data-tour="p6-lab" className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <Slider
          label="Your Trade Size"
          value={tradeSize}
          min={5000}
          max={200000}
          step={5000}
          formatValue={(v) => `$${v.toLocaleString()}`}
          onChange={setTradeSize}
        />
        <Slider
          label="Pool Depth"
          value={depth}
          min={50000}
          max={1000000}
          step={50000}
          formatValue={(v) => `$${v.toLocaleString()}`}
          onChange={setDepth}
        />
        <Slider
          label="Your Slippage Tolerance"
          value={slippage}
          min={0.1}
          max={5}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)}%`}
          onChange={setSlippage}
          helperText="This is the door you leave open"
        />

        <button
          type="button"
          onClick={() => setProtectedRoute((p) => !p)}
          className={`w-full p-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
            protectedRoute
              ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
              : 'bg-bg border-border text-ink-soft hover:text-ink'
          }`}
        >
          {protectedRoute ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {protectedRoute ? 'Private / Protected Routing ON' : 'Public Mempool (visible to bots)'}
        </button>

        {/* Sandwich visualization */}
        <div className="p-4 rounded-xl bg-bg border border-border space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-red-600">① bot front-runs (buys)</span>
            <span className={botProfit > 0 ? 'text-red-600' : 'text-ink-soft'}>
              {botProfit > 0 ? 'price ↑' : 'hidden'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-ink">② your swap fills</span>
            <span className="text-ink-soft">
              {protectedRoute ? `${0}% worse` : `${yourWorseFill.toFixed(2)}% worse`}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-red-600">③ bot back-runs (sells)</span>
            <span className={botProfit > 0 ? 'text-red-600' : 'text-ink-soft'}>
              {botProfit > 0 ? 'price ↓' : 'hidden'}
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border-2 space-y-2 ${
            botProfit > 0 ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink">Extracted From You</span>
            <span className={`font-mono font-semibold text-2xl ${botProfit > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ${botProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Your true price impact</span>
            <span className="font-mono font-semibold text-ink">{priceImpactPct.toFixed(2)}%</span>
          </div>
          {wouldRevert && (
            <p className="text-[11px] text-amber-700 pt-1 border-t border-emerald-200">
              Heads up: your size ({priceImpactPct.toFixed(2)}% impact) exceeds your {slippage.toFixed(1)}%
              tolerance - this swap may revert even with protection.
            </p>
          )}
        </div>
      </Card>

      <Card data-tour="p6-explainer" className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {botProfit > 0 ? (
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {protectedRoute
              ? `With private routing, your transaction never hit the public mempool, so no bot could see it to sandwich you. Extracted value: $0 - you paid only your honest ${priceImpactPct.toFixed(2)}% price impact.${wouldRevert ? ' The trade-off: your tolerance is tighter than your own impact, so it may revert. Set it just above your real impact.' : ''}`
              : botProfit > 0
              ? `Your ${slippage.toFixed(1)}% tolerance told the bot exactly how far it could push the price. It front-ran, you filled ${yourWorseFill.toFixed(2)}% worse, it back-ran and pocketed $${botProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} from your own buying pressure. Nothing failed - you just supplied the exit liquidity. Tighten slippage or route privately.`
              : `Your tolerance (${slippage.toFixed(1)}%) was tighter than your own price impact (${priceImpactPct.toFixed(2)}%), so there was almost nothing left for a bot to take after fees. Tight slippage on a deep pool is a poor target. The catch: tolerance this tight can also make your own swap revert.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
