'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { TrendingDown, TrendingUp, Layers, HelpCircle, Info, RotateCcw, CheckCircle2 } from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function I4Companion() {
  const [initialPriceRatio, setInitialPriceRatio] = useState(200); // $200 per SOL
  const [newPriceRatio, setNewPriceRatio] = useState(300); // Price changes to $300
  const [initialSolDeposit, setInitialSolDeposit] = useState(10); // 10 SOL
  const [tradingFeeApy, setTradingFeeApy] = useState(15); // 15% APY in fees
  const [isTourActive, setIsTourActive] = useState(false);

  // Price change factor k = P_new / P_old
  const priceRatioK = newPriceRatio / initialPriceRatio;

  // Impermanent Loss formula: 2 * sqrt(k) / (1 + k) - 1
  const impermanentLossPct = (2 * Math.sqrt(priceRatioK)) / (1 + priceRatioK) - 1;
  const ilLossPositivePct = Math.abs(impermanentLossPct * 100);

  // Initial position: 10 SOL and (10 * 200) = $2,000 USDC -> Total $4,000
  const initialValueUsd = initialSolDeposit * 2 * initialPriceRatio;

  // If you just HELD: 10 SOL * newPrice + $2000 USDC
  const hodlValueUsd = (initialSolDeposit * newPriceRatio) + (initialSolDeposit * initialPriceRatio);

  // If you provided LP: hodlValue * (1 + IL)
  const lpValueUsd = hodlValueUsd * (1 + impermanentLossPct);
  const ilDollarLoss = hodlValueUsd - lpValueUsd;

  // 1 year of estimated fee earnings
  const feeEarningsUsd = initialValueUsd * (tradingFeeApy / 100);
  const netLpGainUsd = (lpValueUsd + feeEarningsUsd) - hodlValueUsd;

  const handleReset = () => {
    setInitialPriceRatio(200);
    setNewPriceRatio(300);
    setInitialSolDeposit(10);
    setTradingFeeApy(15);
  };

  const tourSteps = [
    {
      target: '[data-tour="i4-lab-header"]',
      title: 'Welcome to the IL Engine',
      text: 'This panel quantifies the hidden enemy of liquidity providers: impermanent loss. You will see in dollars exactly what a price move costs you compared to just holding.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i4-controls"]',
      title: 'Set the Market Move',
      text: 'These three sliders are the inputs: your price at deposit time, the new market price after the move, and the fee APY your pool pays. Drag "New Current SOL Price" and watch the loss math explode.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i4-il-gauge"]',
      title: 'The Divergence Loss',
      text: 'This gauge is the headline number. The valuation formula IL = 2·√k / (1 + k) − 1 measures how far your LP position drifts from just holding. Fees (green) are your shield against it.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i4-reset"]',
      title: 'Reset and Re-Test',
      text: 'Reset to the default 200→300 price move whenever you want to re-run the experiment. Raise the fee APY to see how high fees can out-earn a painful IL.',
      side: 'top' as const,
    },
  ];

  return (
    <div className="w-full max-w-lg space-y-5">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div data-tour="i4-lab-header" className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB I4 • IMPERMANENT LOSS ENGINE
          </Badge>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTourActive(true)}
              className="gap-1.5 text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent" /> Tour
            </Button>
            <Button
              data-tour="i4-reset"
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
          Impermanent Loss (IL) Calculator
        </h3>
        <p className="text-xs text-ink-soft">
          Drag the new price slider to witness the mathematical divergence between HODLing and LPing.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
            Lab Simulator
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            No real wallet · Nothing costs money
          </span>
        </div>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div data-tour="i4-controls" className="space-y-4">
          <Slider
            label="Initial SOL Deposit Price"
            value={initialPriceRatio}
            min={50}
            max={300}
            step={5}
            unit="USD"
            onChange={setInitialPriceRatio}
          />

          <Slider
            label="New Current SOL Price (Market Movement)"
            value={newPriceRatio}
            min={20}
            max={600}
            step={5}
            unit="USD"
            onChange={setNewPriceRatio}
          />

          <Slider
            label="Estimated Pool Trading Fee APY"
            value={tradingFeeApy}
            min={0}
            max={50}
            step={1}
            unit="%"
            onChange={setTradingFeeApy}
          />
        </div>

        {/* Impermanent Loss Gauge */}
        <div data-tour="i4-il-gauge" className="p-4 rounded-xl bg-bg border border-border space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-xs uppercase tracking-wider text-ink">
              Impermanent Loss (IL):
            </span>
            <span
              className={`font-mono font-semibold text-2xl ${
                ilLossPositivePct > 5 ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              -{ilLossPositivePct.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
              <span className="text-[10px] text-ink-soft uppercase font-medium block">If You Just HELD:</span>
              <span className="font-mono font-semibold text-ink">
                ${Math.round(hodlValueUsd).toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
              <span className="text-[10px] text-ink-soft uppercase font-medium block">Value in LP (excl. fees):</span>
              <span className="font-mono font-semibold text-ink">
                ${Math.round(lpValueUsd).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
            <span className="text-ink-soft">Raw IL Cost (vs. HODL):</span>
            <span className="font-mono font-semibold text-red-600">
              -${Math.round(ilDollarLoss).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-ink-soft">1-Year Fee Accrual (+{tradingFeeApy}% APY):</span>
            <span className="font-mono font-semibold text-emerald-600">
              +${Math.round(feeEarningsUsd).toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
            <span className="font-medium text-ink">Net Strategy Outcome:</span>
            <span
              className={`font-mono font-semibold text-sm ${
                netLpGainUsd >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {netLpGainUsd >= 0 ? '+' : ''}${Math.round(netLpGainUsd).toLocaleString()} USD
            </span>
          </div>
        </div>

        {/* Educational Callout */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Why is it called "Impermanent"?</span>
          </div>
          <p className="leading-relaxed">
            The loss is "impermanent" because if the price ratio returns back to its original $200 level, your loss drops right back to 0.00%! It only becomes a <strong>permanent</strong> loss the exact moment you withdraw your liquidity from the pool.
          </p>
        </div>
      </Card>

      {/* What Just Happened? */}
      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            The price moved from ${initialPriceRatio} to ${newPriceRatio} - a {priceRatioK.toFixed(2)}x move. Your position now carries -{ilLossPositivePct.toFixed(2)}% impermanent loss (-${Math.round(ilDollarLoss).toLocaleString()} vs just HODLing). At {tradingFeeApy}% fee APY, swap fees pay +${Math.round(feeEarningsUsd).toLocaleString()} over the year, so the net outcome is {netLpGainUsd >= 0 ? '+' : '-'}${Math.round(Math.abs(netLpGainUsd)).toLocaleString()}. IL is the price you pay to earn those fees - and if the price ratio returns to the start, the loss evaporates.
          </p>
        </div>
      </Card>
    </div>
  );
}
