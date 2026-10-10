'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, ShieldCheck, ShieldAlert, Crosshair } from 'lucide-react';

export function P5Companion() {
  const [poolDepth, setPoolDepth] = useState(20000);
  const [borrow, setBorrow] = useState(200000);
  const [oracleType, setOracleType] = useState<'spot' | 'twap'>('spot');
  const [protocolTVL, setProtocolTVL] = useState(5000000);

  const handleReset = () => {
    setPoolDepth(20000);
    setBorrow(200000);
    setOracleType('spot');
    setProtocolTVL(5000000);
  };

  // x*y=k: adding Q quote to a pool of depth Q0 raises price by ((Q0+borrow)/Q0)^2
  const ratio = 1 + borrow / poolDepth;
  const manipulatedPrice = ratio * ratio; // relative to base price of 1
  // TWAP heavily dilutes a one-transaction spike.
  const oraclePrice =
    oracleType === 'spot' ? manipulatedPrice : 1 + (manipulatedPrice - 1) * 0.06;

  // Attacker extracts up to TVL * (inflated - 1), capped at TVL.
  const extracted = Math.min(protocolTVL, protocolTVL * (oraclePrice - 1));
  // Round-trip slippage cost of moving the pool twice (quadratic in size).
  const cost = borrow * (borrow / poolDepth);
  const netProfit = extracted - cost;
  const profitable = netProfit > 0;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P5 &bull; ORACLE ATTACK
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Flash-Loan Oracle Attack</h3>
        <p className="text-xs text-ink-soft">
          Flash-borrow, smash the pool, move the oracle, drain the protocol. Or fail.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setOracleType('spot')}
            className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
              oracleType === 'spot'
                ? 'bg-red-50 border-red-400 text-red-700 font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Spot Oracle
          </button>
          <button
            type="button"
            onClick={() => setOracleType('twap')}
            className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
              oracleType === 'twap'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> TWAP Oracle
          </button>
        </div>

        <Slider
          label="Victim Pool Depth (quote side)"
          value={poolDepth}
          min={2000}
          max={100000}
          step={2000}
          formatValue={(v) => `$${v.toLocaleString()}`}
          onChange={setPoolDepth}
          helperText="Thin pool = easy to move"
        />
        <Slider
          label="Flash-Borrow Amount"
          value={borrow}
          min={10000}
          max={2000000}
          step={10000}
          formatValue={(v) => `$${v.toLocaleString()}`}
          onChange={setBorrow}
        />
        <Slider
          label="Protocol TVL (the prize)"
          value={protocolTVL}
          min={500000}
          max={50000000}
          step={500000}
          formatValue={(v) => `$${(v / 1000000).toFixed(1)}M`}
          onChange={setProtocolTVL}
        />

        <div className="p-4 rounded-xl bg-bg border border-border space-y-2">
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Pool price after dump</span>
            <span className="font-mono font-semibold text-red-600">${manipulatedPrice.toFixed(3)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Oracle reads</span>
            <span
              className={`font-mono font-semibold ${oracleType === 'spot' ? 'text-red-600' : 'text-emerald-600'}`}
            >
              ${oraclePrice.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Attack cost (slippage)</span>
            <span className="font-mono font-semibold text-ink">${cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Extractable value</span>
            <span className="font-mono font-semibold text-ink">${extracted.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border-2 space-y-1 ${
            profitable ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" /> Attacker Net Profit
            </span>
            <span className={`font-mono font-semibold text-2xl ${profitable ? 'text-red-600' : 'text-emerald-600'}`}>
              {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-[11px] text-ink-soft">
            {profitable
              ? 'Profit is positive - bots will run this attack against you.'
              : 'Attack is unprofitable - rational bots skip it. This is how you actually win.'}
          </p>
        </div>
      </Card>

      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {profitable ? (
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {oracleType === 'spot'
              ? profitable
                ? `The flash loan pumped the ${poolDepth.toLocaleString()}-depth pool, moving its price ${((manipulatedPrice - 1) * 100).toFixed(0)}%. Because the protocol reads that spot ratio directly, its oracle believed the token was worth $${oraclePrice.toFixed(2)} and let the attacker borrow against fake value - draining $${extracted.toLocaleString(undefined, { maximumFractionDigits: 0 })} for a $${cost.toLocaleString(undefined, { maximumFractionDigits: 0 })} cost. All in one transaction.`
                : `The dump moved the pool, but the round-trip slippage cost ($${cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}) exceeded what could be extracted ($${extracted.toLocaleString(undefined, { maximumFractionDigits: 0 })}). Even a manipulable spot oracle is safe if the pool is deep enough that moving it costs more than the prize. Depth is a defense.`
              : `The TWAP averaged the pool over a time window, so your one-transaction spike barely registered - the oracle only budged to $${oraclePrice.toFixed(2)}. To manipulate a TWAP you would have to hold the distorted price across many blocks, which is expensive and gets arbitraged back. That is why time-averaging turns a nine-figure exploit into a non-event.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
