'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, RotateCcw, Info, HelpCircle, CheckCircle2 } from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function I5Companion() {
  const [modelType, setModelType] = useState<'fiat' | 'overcollateralized' | 'algorithmic'>('algorithmic');
  const [redemptionRushPct, setRedemptionRushPct] = useState(20); // 20% redemption run
  const [isTourActive, setIsTourActive] = useState(false);

  // Model parameters
  // 1. Fiat-backed: $100M supply, $100M treasury reserve
  // 2. Crypto-overcollateralized: $100M supply, $150M SOL collateral (150% ratio)
  // 3. Algorithmic: $100M supply, backed by volatile sister token minting

  const calculatePegState = () => {
    if (modelType === 'fiat') {
      // 100% 1:1 backing, redemption always pays $1.00
      return {
        pegPrice: 1.00,
        collateralRatio: 100,
        status: 'Solid Peg',
        isDepeg: false,
        explanation: 'Audited 1:1 cash reserves in banks ensure every redeemed stablecoin receives exactly $1.00.',
      };
    } else if (modelType === 'overcollateralized') {
      const remainingCollateralRatio = Math.max(80, 150 - (redemptionRushPct * 0.4));
      const pegPrice = remainingCollateralRatio >= 110 ? 1.00 : remainingCollateralRatio / 110;
      return {
        pegPrice: Math.min(1.0, pegPrice),
        collateralRatio: remainingCollateralRatio,
        status: pegPrice >= 0.99 ? 'Solid Peg' : 'Stress / Soft Depeg',
        isDepeg: pegPrice < 0.99,
        explanation: 'Overcollateralized vault automatically liquidates bad debt to maintain $1.00 redemption stability.',
      };
    } else {
      // Algorithmic death spiral simulation
      const deathSpiralThreshold = 35;
      const severity = redemptionRushPct / 100;
      let pegPrice = 1.00;

      if (redemptionRushPct <= deathSpiralThreshold) {
        pegPrice = 1.00 - (severity * 0.08); // small wobble
      } else {
        // Exponential collapse
        const excess = (redemptionRushPct - deathSpiralThreshold) / 100;
        pegPrice = Math.max(0.04, 1.00 - (severity * 0.15) - Math.pow(excess * 3, 2));
      }

      const collatRatio = Math.max(5, 100 - (redemptionRushPct * 1.3));

      return {
        pegPrice,
        collateralRatio: collatRatio,
        status: pegPrice < 0.85 ? 'Death Spiral Depeg' : pegPrice < 0.98 ? 'Vulnerable Wobble' : 'Peg Intact',
        isDepeg: pegPrice < 0.95,
        explanation:
          redemptionRushPct > deathSpiralThreshold
            ? 'CATASTROPHIC DEPEG! Mass redemptions hyper-inflated the sister token supply, destroying confidence and collapsing the peg toward zero (Luna/UST mechanism).'
            : 'Sister token absorption can handle mild exit volume, but remains highly vulnerable to a sustained bank run.',
      };
    }
  };

  const pegState = calculatePegState();

  const handleReset = () => {
    setModelType('algorithmic');
    setRedemptionRushPct(20);
  };

  const tourSteps = [
    {
      target: '[data-tour="i5-lab-header"]',
      title: 'Welcome to the Bank Run',
      text: 'This panel puts three stablecoin architectures through a stress test. What happens to a $1 peg when panic makes everyone redeem at once? Here is where you find out, safely.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i5-model-selector"]',
      title: 'Choose the Reserve Model',
      text: 'Fiat-backed (USDC) holds real cash. Crypto-backed (DAI) holds overcollateralized vaults. Algorithmic (UST) relies on a sister token to absorb exits - the fragile one that actually died in 2022.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i5-bank-run"]',
      title: 'Apply Redemption Pressure',
      text: 'This slider is the bank run itself: how much of the supply tries to redeem at the same time. Crank it to 90% and watch each architecture respond completely differently.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i5-peg-gauge"]',
      title: 'Watch the Peg',
      text: 'This gauge is the stablecoin market price. In a real depeg, cascading liquidations below $0.98 can turn a wobble into a collapse. The explanation box below tells you exactly which mechanism broke.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i5-reset"]',
      title: 'Reset and Compare',
      text: 'Reset to the explosive algorithmic default whenever you want. Run the exact same 40% redemption on all three models to see why backing quality is the whole game.',
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

      <div data-tour="i5-lab-header" className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB I5 • STABLECOIN STRESS TEST
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
              data-tour="i5-reset"
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
          The Bank Run & Depeg Simulator
        </h3>
        <p className="text-xs text-ink-soft">
          Test how different stablecoin reserve architectures withstand mass redemption bank runs.
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
        {/* Model Selector */}
        <div data-tour="i5-model-selector" className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setModelType('fiat')}
            className={`p-2.5 rounded-lg border transition-all ${
              modelType === 'fiat'
                ? 'bg-primary-light border-primary text-primary font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            Fiat-Backed (USDC)
          </button>
          <button
            type="button"
            onClick={() => setModelType('overcollateralized')}
            className={`p-2.5 rounded-lg border transition-all ${
              modelType === 'overcollateralized'
                ? 'bg-primary-light border-primary text-primary font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            Crypto-Backed (DAI)
          </button>
          <button
            type="button"
            onClick={() => setModelType('algorithmic')}
            className={`p-2.5 rounded-lg border transition-all ${
              modelType === 'algorithmic'
                ? 'bg-red-50 border-red-300 text-red-700 font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            Algorithmic (UST)
          </button>
        </div>

        {/* Bank Run Slider */}
        <div data-tour="i5-bank-run">
          <Slider
            label="Bank Run Pressure (% of Supply Redeemed Simultaneously)"
            value={redemptionRushPct}
            min={5}
            max={90}
            step={5}
            unit="%"
            onChange={setRedemptionRushPct}
          />
        </div>

        {/* Peg Gauge Card */}
        <div data-tour="i5-peg-gauge" className="p-4 rounded-xl bg-bg border border-border space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-xs uppercase tracking-wider text-ink">
              Stablecoin Market Price:
            </span>
            <span
              className={`font-mono font-semibold text-2xl ${
                pegState.pegPrice < 0.8
                  ? 'text-red-600'
                  : pegState.pegPrice < 0.98
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              ${pegState.pegPrice.toFixed(3)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Peg Health Status:</span>
            <Badge
              variant={pegState.isDepeg ? 'danger' : 'accent'}
              className="text-[10px]"
            >
              {pegState.status}
            </Badge>
          </div>

          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Remaining Reserve Ratio:</span>
            <span className="font-mono font-semibold text-ink">
              {pegState.collateralRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Educational Callout */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Why Peg Defense Matters</span>
          </div>
          <p className="leading-relaxed">
            In crypto lending markets (like Kamino or Solend), if a stablecoin depegs below $0.98, borrowers who deposited it as collateral get liquidated en masse. Always inspect the underlying reserve assets backing any stablecoin you hold!
          </p>
        </div>
      </Card>

      {/* What Just Happened? */}
      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {modelType === 'fiat'
              ? `Fiat-backed reserves held the $1 peg even under ${redemptionRushPct}% redemption pressure. Every coin is backed by a dollar in a bank account, so a bank run simply honours redemptions 1:1 - the peg is backed by an asset, not a promise.`
              : modelType === 'overcollateralized'
              ? `Crypto-collateralised vaults absorbed the ${redemptionRushPct}% run by automatically liquidating collateral to stay solvent: the reserve ratio now reads ${pegState.collateralRatio.toFixed(1)}% and the peg traded at $${pegState.pegPrice.toFixed(3)}. Overcollateralisation only cracks under stress larger than the buffer.`
              : pegState.isDepeg
              ? `Catastrophic depeg! Mass redemptions forced the sister token to mint endlessly, hyper-inflating supply until confidence collapsed and the price slid to $${pegState.pegPrice.toFixed(3)}. This is the exact Luna/UST mechanism - a peg without hard backing is a promise, not an asset.`
              : `The sister token absorbed ${redemptionRushPct}% of exits by inflating its own supply - the peg wobbled to $${pegState.pegPrice.toFixed(3)} but held. Below the death-spiral threshold this works; there is just no reserve to save it in a real crisis.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
