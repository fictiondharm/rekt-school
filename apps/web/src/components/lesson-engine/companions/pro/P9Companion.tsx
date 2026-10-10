'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, CheckCircle2, TrendingDown, ExternalLink, Flame } from 'lucide-react';

const K = 1e-8; // price = supply * K

function supplyFor(supply: number, quote: number) {
  return Math.sqrt(supply * supply + (2 * quote) / K);
}

export function P9Companion() {
  const [buySize, setBuySize] = useState(5000);
  const [inflow, setInflow] = useState(250000);
  const [rugged, setRugged] = useState(false);

  const handleReset = () => {
    setBuySize(5000);
    setInflow(250000);
    setRugged(false);
  };

  const S0 = 1000000; // starting supply on the curve
  const S1 = supplyFor(S0, buySize); // after your buy
  const S2 = supplyFor(S1, inflow); // after the crowd buys
  const yourTokens = S1 - S0;
  const entryPrice = buySize / yourTokens;
  const currentPrice = S2 * K;
  const valueNow = rugged ? 0 : yourTokens * currentPrice;
  const pnl = valueNow - buySize;
  const pnlPct = (pnl / buySize) * 100;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P9 &bull; BONDING CURVE SNIPER
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Bonding Curve Launch</h3>
        <p className="text-xs text-ink-soft">
          Price rises with supply. Buy early, hope the crowd arrives, fear the rug.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <Slider
          label="Your Buy Size"
          value={buySize}
          min={500}
          max={50000}
          step={500}
          formatValue={(v) => `$${v.toLocaleString()}`}
          onChange={setBuySize}
        />
        <Slider
          label="Crowd Inflow After You"
          value={inflow}
          min={0}
          max={5000000}
          step={25000}
          formatValue={(v) => `$${v.toLocaleString()}`}
          onChange={setInflow}
          helperText="Your exit liquidity"
        />

        <button
          type="button"
          onClick={() => setRugged((r) => !r)}
          className={`w-full p-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
            rugged ? 'bg-red-50 border-red-400 text-red-700' : 'bg-bg border-border text-ink-soft hover:text-ink'
          }`}
        >
          <Flame className="w-4 h-4" />
          {rugged ? 'Creator RUGGED the liquidity' : 'Creator is honest (for now)'}
        </button>

        {/* Curve visualization */}
        <div className="p-4 rounded-xl bg-bg border border-border space-y-2">
          <div className="relative h-20">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <polyline
                points={Array.from({ length: 40 })
                  .map((_, i) => {
                    const s = S0 + (i / 39) * (S2 - S0);
                    const price = s * K;
                    const maxP = S2 * K;
                    return `${(i / 39) * 100},${100 - (price / maxP) * 85}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
              />
              <circle cx={((S0 - S0) / (S2 - S0)) * 100} cy={100 - ((S0 * K) / (S2 * K)) * 85} r="2.5" fill="#0f172a" />
              <circle cx={((S1 - S0) / (S2 - S0)) * 100} cy={100 - ((S1 * K) / (S2 * K)) * 85} r="2.5" fill="#2563eb" />
              <circle cx="100" cy="15" r="2.5" fill="#16a34a" />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-ink-soft">
            <span>launch</span>
            <span className="text-blue-600">you buy</span>
            <span className="text-emerald-600">crowd arrives</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Your Avg Entry</span>
            <span className="font-mono font-semibold text-lg text-ink">${entryPrice.toFixed(6)}</span>
          </div>
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Price Now</span>
            <span className="font-mono font-semibold text-lg text-ink">${currentPrice.toFixed(6)}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border-2 space-y-1 ${
            pnl >= 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink">Your Position Value</span>
            <span className={`font-mono font-semibold text-2xl ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${valueNow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Unrealized P&amp;L</span>
            <span className={`font-mono font-semibold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({pnlPct.toFixed(0)}%)
            </span>
          </div>
        </div>

        <a
          href="https://pump.fun"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[11px] text-accent hover:underline"
        >
          This is a simulation - you can explore real launchpads here <ExternalLink className="w-3 h-3" />
        </a>
      </Card>

      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {pnl >= 0 && !rugged ? (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {rugged
              ? `The creator pulled the liquidity and your position is worth $0 - total loss of your $${buySize.toLocaleString()}. The curve was honest math; the CREATOR was not. This is the risk no amount of chart-reading removes: your downside is 100%, and it can happen in one transaction.`
              : pnl >= 0
              ? `You bought ${yourTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} tokens at an average of $${entryPrice.toFixed(6)}. The crowd then pushed $${inflow.toLocaleString()} of inflow up the curve, lifting price to $${currentPrice.toFixed(6)} and your position to $${valueNow.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Your profit came dollar-for-dollar from later buyers - you are currently their exit liquidity, and the moment inflow stops, this reverses.`
              : `You bought on the curve at $${entryPrice.toFixed(6)}, but only $${inflow.toLocaleString()} of new money followed. Selling supply back down the curve means you cannot recover your $${buySize.toLocaleString()} - you are down ${Math.abs(pnlPct).toFixed(0)}%. With no fresh buyers, the curve runs in reverse and the last ones in eat the loss. There is no revenue here - only a rearrangement of money.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
