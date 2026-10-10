'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, CheckCircle2, ArrowDownUp } from 'lucide-react';

export function P4Companion() {
  const [rateBps, setRateBps] = useState(3); // per 8h in bps (0.03% default)
  const [notional, setNotional] = useState(100000);
  const [days, setDays] = useState(30);
  const [side, setSide] = useState<'shortPerp' | 'longPerp'>('shortPerp');

  const handleReset = () => {
    setRateBps(3);
    setNotional(100000);
    setDays(30);
    setSide('shortPerp');
  };

  const rate = rateBps / 10000; // per 8h
  const paymentsPerDay = 3;
  // Positive funding: longs pay shorts. Short perp receives, long perp pays.
  const sign = side === 'shortPerp' ? 1 : -1;
  const paymentPer8h = rate * notional * sign;
  const perDay = paymentPer8h * paymentsPerDay;
  const total = perDay * days;
  const annualizedPct = rate * paymentsPerDay * 365 * 100;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P4 &bull; FUNDING ARBITRAGE
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Funding Rate Cash Flow</h3>
        <p className="text-xs text-ink-soft">
          Collect (or pay) funding every 8 hours. Positive funding = longs pay shorts.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSide('shortPerp')}
            className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
              side === 'shortPerp'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            <ArrowDownUp className="w-3.5 h-3.5" /> Delta-Neutral (short perp)
          </button>
          <button
            type="button"
            onClick={() => setSide('longPerp')}
            className={`p-2.5 rounded-lg border transition-all ${
              side === 'longPerp'
                ? 'bg-red-50 border-red-400 text-red-700 font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            Long perp only
          </button>
        </div>

        <Slider
          label="Funding Rate (per 8h)"
          value={rateBps}
          min={-50}
          max={150}
          step={1}
          formatValue={(v) => `${(v / 100).toFixed(2)}%`}
          onChange={setRateBps}
        />
        <Slider
          label="Position Notional"
          value={notional}
          min={10000}
          max={1000000}
          step={10000}
          formatValue={(v) => `$${v.toLocaleString()}`}
          onChange={setNotional}
        />
        <Slider
          label="Holding Period"
          value={days}
          min={1}
          max={90}
          step={1}
          formatValue={(v) => `${v} days`}
          onChange={setDays}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Per 8h</span>
            <span className={`font-mono font-semibold text-lg ${paymentPer8h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {paymentPer8h >= 0 ? '+' : '-'}${Math.abs(paymentPer8h).toFixed(2)}
            </span>
          </div>
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">Per Day</span>
            <span className={`font-mono font-semibold text-lg ${perDay >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {perDay >= 0 ? '+' : '-'}${Math.abs(perDay).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink">Total over {days}d</span>
            <span className={`font-mono font-semibold text-2xl ${total >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {total >= 0 ? '+' : '-'}${Math.abs(total).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Annualized rate</span>
            <span className="font-mono font-semibold text-ink">{annualizedPct.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Funding side</span>
            <Badge variant={rateBps >= 0 ? 'accent' : 'warn'} className="text-[10px]">
              {rateBps >= 0 ? 'LONGS PAY SHORTS' : 'SHORTS PAY LONGS'}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {side === 'shortPerp'
              ? rateBps >= 0
                ? `You are short the perp against a spot long, so price direction cancels out. With funding at ${(rateBps / 100).toFixed(2)}% per 8h, longs pay you $${paymentPer8h.toFixed(2)} every 8 hours. Over ${days} days that is ${total >= 0 ? '+' : ''}$${Math.abs(total).toFixed(0)} of pure funding harvest - but if the rate flips negative you become the payer, and a violent squeeze can liquidate your short leg.`
                : `Funding is negative, so shorts PAY longs. As a short you are now on the paying side, bleeding $${Math.abs(paymentPer8h).toFixed(2)} per 8 hours. The delta-neutral trade only works when funding is positive - chase the sign, not the strategy.`
              : `You are long the perp outright, so you have full price exposure AND you ${rateBps >= 0 ? 'pay' : 'collect'} funding. At ${(rateBps / 100).toFixed(2)}% per 8h you ${rateBps >= 0 ? `pay $${Math.abs(paymentPer8h).toFixed(2)}` : `receive $${Math.abs(paymentPer8h).toFixed(2)}`} every period. Being long the crowded side means funding works against you - the crowd pays for its conviction.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
