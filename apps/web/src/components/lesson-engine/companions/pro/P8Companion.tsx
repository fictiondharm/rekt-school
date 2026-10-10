'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, CheckCircle2, ShieldAlert, ExternalLink, Lock, Unlock } from 'lucide-react';

type Trust = 'multisig' | 'optimistic' | 'zk';

export function P8Companion() {
  const [deposit, setDeposit] = useState(1000000);
  const [trust, setTrust] = useState<Trust>('multisig');
  const [attacked, setAttacked] = useState(false);

  const handleReset = () => {
    setDeposit(1000000);
    setTrust('multisig');
    setAttacked(false);
  };

  // Fraction an attacker can drain given the trust model.
  const drainFraction = trust === 'multisig' ? 1 : trust === 'optimistic' ? 0.1 : 0;
  const stolen = attacked ? deposit * drainFraction : 0;

  const reservesAfter = deposit - stolen;
  const supplyAfter = deposit + stolen; // attacker minted unbacked wrapped tokens
  const peg = supplyAfter > 0 ? reservesAfter / supplyAfter : 1;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P8 &bull; BRIDGE LOCK-AND-MINT
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Bridge Reserve Simulator</h3>
        <p className="text-xs text-ink-soft">
          Lock value on the source chain, mint wrapped tokens on the destination. Then attack it.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {([
            ['multisig', 'Multisig (2-of-9)'],
            ['optimistic', 'Optimistic + rate limit'],
            ['zk', 'zk Proof Verification'],
          ] as [Trust, string][]).map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrust(t)}
              className={`p-2 rounded-lg border transition-all ${
                trust === t
                  ? t === 'zk'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold'
                    : 'bg-red-50 border-red-400 text-red-700 font-semibold'
                  : 'bg-bg border-border text-ink-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Slider
          label="Value Locked on Source Chain"
          value={deposit}
          min={100000}
          max={10000000}
          step={100000}
          formatValue={(v) => `$${(v / 1000000).toFixed(1)}M`}
          onChange={setDeposit}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block flex items-center gap-1">
              <Lock className="w-3 h-3" /> Locked Reserves
            </span>
            <span className="font-mono font-semibold text-lg text-ink">
              ${(reservesAfter / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft block flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Wrapped Supply
            </span>
            <span className="font-mono font-semibold text-lg text-ink">
              ${(supplyAfter / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border-2 space-y-2 ${
            peg >= 0.99 ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink">Wrapped Asset Peg</span>
            <span className={`font-mono font-semibold text-2xl ${peg >= 0.99 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${peg.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Backing ratio (reserves ÷ supply)</span>
            <span className="font-mono font-semibold text-ink">{(peg * 100).toFixed(1)}%</span>
          </div>
        </div>

        <Button
          variant={attacked ? 'secondary' : 'danger'}
          onClick={() => setAttacked((a) => !a)}
          className="w-full gap-2 text-xs"
        >
          <ShieldAlert className="w-4 h-4" />
          {attacked ? 'Reset Attack State (toggle off)' : 'Launch Bridge Exploit'}
        </Button>

        <a
          href="https://wormhole.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[11px] text-accent hover:underline"
        >
          This is a simulation - you can explore real bridges here <ExternalLink className="w-3 h-3" />
        </a>
      </Card>

      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {peg >= 0.99 ? (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {!attacked
              ? `You locked $${(deposit / 1000000).toFixed(1)}M on the source chain and the bridge minted an equal $${(deposit / 1000000).toFixed(1)}M of wrapped tokens. Reserves back supply 1:1, so the peg sits at $1.00. This is the healthy state - the question is always who can break it.`
              : trust === 'multisig'
              ? `The attacker compromised the 2-of-9 multisig and forged a deposit that never happened, minting $${(stolen / 1000000).toFixed(1)}M of unbacked wrapped tokens and swapping them for the entire reserve. Reserves hit zero while supply doubled - the peg collapsed to $${peg.toFixed(3)}. Everyone holding the wrapped asset was wiped out through no fault of their own.`
              : trust === 'optimistic'
              ? `The rate limit capped the drain at 10%, so the attacker only smuggled out $${(stolen / 1000000).toFixed(1)}M before the limiter kicked in. The peg slipped to $${peg.toFixed(3)} - painful, but survivable rather than terminal. Rate limits turn a catastrophe into a bad day.`
              : `The bridge verified a cryptographic proof of the source chain, so the forged mint was rejected outright. Nothing was extracted and the peg held at $${peg.toFixed(3)}. This is why proof-based bridges are the strongest model - the destination chain checks reality instead of trusting a signer.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
