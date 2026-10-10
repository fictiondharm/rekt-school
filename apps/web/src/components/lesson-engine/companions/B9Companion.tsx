'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { Landmark, TrendingUp, AlertTriangle, Layers, Info, CheckCircle2 } from 'lucide-react';

export function B9Companion() {
  const [solDeposits, setSolDeposits] = useState(5000); // 5,000 SOL
  const [solPrice, setSolPrice] = useState(200); // $200
  const [usdcDeposits, setUsdcDeposits] = useState(1500000); // $1.5M USDC
  const [borrowedAmount, setBorrowedAmount] = useState(800000); // $800k borrowed
  const [excludeBorrowed, setExcludeBorrowed] = useState(true);

  // Gross TVL = all assets in vaults
  const grossTVL = (solDeposits * solPrice) + usdcDeposits;
  // Net TVL = deposits minus outstanding debt
  const netTVL = grossTVL - (excludeBorrowed ? borrowedAmount : 0);
  const utilizationRate = grossTVL > 0 ? (borrowedAmount / grossTVL) * 100 : 0;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <Badge variant="primary" className="mb-1">
          LAB B9 • PROTOCOL TVL EXPLORER
        </Badge>
        <h3 className="font-heading font-semibold text-xl text-ink">
          Total Value Locked (TVL) Simulator
        </h3>
        <p className="text-xs text-ink-soft">
          See how asset deposits, market prices, and re-hypothecated borrowing shape protocol TVL.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        {/* Sliders */}
        <div className="space-y-4">
          <Slider
            label="Deposited SOL in Vaults"
            value={solDeposits}
            min={100}
            max={20000}
            step={100}
            unit="SOL"
            onChange={setSolDeposits}
          />

          <Slider
            label="SOL Market Price"
            value={solPrice}
            min={50}
            max={500}
            step={5}
            unit="USD"
            onChange={setSolPrice}
          />

          <Slider
            label="Deposited Stablecoins (fUSDC)"
            value={usdcDeposits}
            min={100000}
            max={5000000}
            step={50000}
            unit="fUSDC"
            onChange={setUsdcDeposits}
          />
        </div>

        {/* TVL Metrics Display */}
        <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-xs uppercase tracking-wider text-ink">
              Protocol Gross TVL:
            </span>
            <span className="font-mono font-semibold text-xl text-primary">
              ${grossTVL.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>SOL Share of TVL:</span>
            <span className="font-mono font-semibold text-ink">
              ${(solDeposits * solPrice).toLocaleString()} ({((solDeposits * solPrice / grossTVL) * 100).toFixed(1)}%)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Stablecoin Share:</span>
            <span className="font-mono font-semibold text-ink">
              ${usdcDeposits.toLocaleString()} ({((usdcDeposits / grossTVL) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Double-counting toggle */}
        <div className="p-3.5 rounded-xl bg-bg border border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-heading font-semibold text-xs text-ink block">
              Deduct Outstanding Borrows (Net TVL)
            </span>
            <span className="text-[11px] text-ink-soft block">
              Subtracts re-hypothecated loans to prevent fake double-counted liquidity.
            </span>
          </div>
          <input
            type="checkbox"
            checked={excludeBorrowed}
            onChange={(e) => setExcludeBorrowed(e.target.checked)}
            className="w-4 h-4 text-primary accent-primary cursor-pointer"
          />
        </div>

        {/* Net TVL Result */}
        <div className="p-3.5 rounded-xl bg-accent-light/50 border border-accent/30 flex justify-between items-center text-xs">
          <div>
            <div className="font-medium text-emerald-950">True Net TVL:</div>
            <div className="text-[11px] text-ink-soft">Utilization: {utilizationRate.toFixed(1)}%</div>
          </div>
          <div className="font-mono font-semibold text-base text-emerald-900">
            ${netTVL.toLocaleString()}
          </div>
        </div>

        {/* Key Lesson Callout */}
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>The TVL Illusion in Crypto</span>
          </div>
          <p className="leading-relaxed">
            When SOL price triples, a protocol's TVL can surge 300% without a single new dollar entering! Always analyze whether TVL growth is driven by genuine organic user inflows or merely token price appreciation.
          </p>
        </div>
      </Card>
    </div>
  );
}
