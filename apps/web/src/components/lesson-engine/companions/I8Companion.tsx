'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { calculateStakingYield, calculateLSTExchangeRate, analyzeLSTDepeg } from '@defi-mommy/sim-core';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Info,
  Layers,
  ArrowRight,
  HelpCircle,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function I8Companion() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'lst-depeg'>('calculator');
  const [isTourActive, setIsTourActive] = useState(false);

  // Staking Calculator State
  const [stakeSOL, setStakeSOL] = useState(100);
  const [inflationRatePct, setInflationRatePct] = useState(6.5);
  const [validatorCommissionPct, setValidatorCommissionPct] = useState(7);
  const [years, setYears] = useState(2);

  // LST Depeg Stress State
  const [lstAgeYears, setLstAgeYears] = useState(1.5);
  const [marketDiscountPct, setMarketDiscountPct] = useState(0); // 0% to 15% panic discount

  // Calculator Math
  const yieldResult = calculateStakingYield(stakeSOL, {
    inflationRate: inflationRatePct / 100,
    validatorCommission: validatorCommissionPct / 100,
    compoundingPeriodsPerYear: 182,
  });

  const totalCompoundedSOL = stakeSOL * Math.pow(1 + yieldResult.netAPY, years);
  const totalEarnedSOL = totalCompoundedSOL - stakeSOL;

  // LST Math
  const fairLSTRate = calculateLSTExchangeRate(1.0, yieldResult.netAPY, lstAgeYears);
  const simulatedMarketPrice = fairLSTRate * (1 - marketDiscountPct / 100);
  const depegAnalysis = analyzeLSTDepeg(fairLSTRate, simulatedMarketPrice);

  const handleReset = () => {
    setActiveTab('calculator');
    setStakeSOL(100);
    setInflationRatePct(6.5);
    setValidatorCommissionPct(7);
    setYears(2);
    setLstAgeYears(1.5);
    setMarketDiscountPct(0);
  };

  const tourSteps = [
    {
      target: '[data-tour="i8-lab-header"]',
      title: 'Welcome to the Staking Engine',
      text: 'This panel models the two sides of liquid staking: what your native SOL earns by staking, and how an LST (like jitoSOL or mSOL) trades on the open market.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i8-tabs"]',
      title: 'Two Tabs, Two Experiments',
      text: 'The Staking Calculator compounds your validator rewards over time. The LST Depeg Stress Test checks whether panic in the secondary market can push the token below its true redemption value.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i8-calculator-results"]',
      title: 'Net APY After the Validator Cut',
      text: 'Network inflation rewards minus the validator commission is your net APY. Compounding happens automatically at epoch boundaries - a ~2-3 day cadence on Solana - so there is no gas cost to restake.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i8-lst-depeg"]',
      title: 'GitHub App: LST Market Stress',
      text: 'In this tab, the panic dump slider can push the DEX price far below the true redemption rate. That gap is an arbitrage spread for patient buyers and a pure paper-loss for panicking sellers.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i8-reset"]',
      title: 'Reset and Re-Run',
      text: 'Reset every input to defaults and run the whole experiment again. The key takeaway: staking yield is real, but only if you hold through the noise.',
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

      <div data-tour="i8-lab-header" className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB I8 • PROOF OF STAKE & LST
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
              data-tour="i8-reset"
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
          Staking & Liquid Staking Engine
        </h3>
        <p className="text-xs text-ink-soft">
          Simulate validator inflation compounding, LST exchange rate appreciation, and secondary market depeg arbitrage.
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

      {/* Tabs */}
      <div data-tour="i8-tabs" className="flex bg-surface p-1 rounded-xl border border-border">
        <button
          data-tour="i8-tab-calculator"
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-2 text-xs font-heading font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'calculator'
              ? 'bg-primary text-white shadow-xs'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          <Coins className="w-3.5 h-3.5" /> Staking Calculator
        </button>
        <button
          data-tour="i8-tab-lst"
          onClick={() => setActiveTab('lst-depeg')}
          className={`flex-1 py-2 text-xs font-heading font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'lst-depeg'
              ? 'bg-primary text-white shadow-xs'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> LST Depeg Stress Test
        </button>
      </div>

      {activeTab === 'calculator' ? (
        <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
          <div className="space-y-4">
            <Slider
              label="Stake Amount"
              value={stakeSOL}
              min={10}
              max={1000}
              step={10}
              unit="SOL"
              onChange={setStakeSOL}
            />

            <Slider
              label="Network Inflation Target"
              value={inflationRatePct}
              min={4.0}
              max={10.0}
              step={0.5}
              unit="%"
              onChange={setInflationRatePct}
            />

            <Slider
              label="Validator Commission Fee"
              value={validatorCommissionPct}
              min={0}
              max={15}
              step={1}
              unit="%"
              onChange={setValidatorCommissionPct}
            />

            <Slider
              label="Holding Period"
              value={years}
              min={1}
              max={5}
              step={1}
              unit="Years"
              onChange={setYears}
            />
          </div>

          {/* Results Summary */}
          <div data-tour="i8-calculator-results" className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-bg rounded-xl border border-border">
              <span className="text-[11px] text-ink-soft block">Net Validator APY</span>
              <span className="text-base font-mono font-semibold text-accent">
                {(yieldResult.netAPY * 100).toFixed(2)}%
              </span>
              <span className="text-[10px] text-ink-soft block mt-0.5">
                Compounded over 182 epochs
              </span>
            </div>

            <div className="p-3 bg-bg rounded-xl border border-border">
              <span className="text-[11px] text-ink-soft block">Validator Cut / Year</span>
              <span className="text-base font-mono font-semibold text-amber-600">
                {yieldResult.validatorFeePerYear.toFixed(2)} SOL
              </span>
              <span className="text-[10px] text-ink-soft block mt-0.5">
                At {validatorCommissionPct}% commission
              </span>
            </div>

            <div className="p-3 bg-primary-light/40 rounded-xl border border-primary/20 col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-primary font-medium block">
                    Portfolio Value After {years} {years === 1 ? 'Year' : 'Years'}
                  </span>
                  <span className="text-xl font-heading font-semibold text-ink">
                    {totalCompoundedSOL.toFixed(2)} SOL
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-accent font-medium block">
                    Total Yield Earned
                  </span>
                  <span className="text-sm font-mono font-semibold text-accent">
                    +{totalEarnedSOL.toFixed(2)} SOL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real World Insight */}
          <div className="p-3.5 bg-bg rounded-xl border border-border text-xs text-ink-soft space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-ink text-[11px]">
              <Info className="w-3.5 h-3.5 text-primary" /> Solana Epoch Reality Check:
            </div>
            <p className="leading-relaxed text-[11px]">
              Solana epochs last ~2 to 3 days (432,000 slots). Rewards compound automatically at epoch boundaries into your stake account without needing manual gas transactions.
            </p>
          </div>
        </Card>
      ) : (
        <Card data-tour="i8-lst-depeg" className="p-6 space-y-5 bg-surface border border-border shadow-sm">
          <div className="space-y-4">
            <Slider
              label="LST Pool Age"
              value={lstAgeYears}
              min={0.5}
              max={4}
              step={0.5}
              unit="Years"
              onChange={setLstAgeYears}
            />

            <Slider
              label="Secondary Market Panic Dump"
              value={marketDiscountPct}
              min={0}
              max={15}
              step={1}
              unit="%"
              onChange={setMarketDiscountPct}
            />
          </div>

          {/* Rates Comparison */}
          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl bg-bg border border-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-soft">True Protocol Redemption Rate:</span>
                <span className="font-mono font-semibold text-ink">
                  1 LST = {fairLSTRate.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-soft">DEX Instant Swap Price:</span>
                <span
                  className={`font-mono font-semibold ${
                    depegAnalysis.isDepegged ? 'text-danger' : 'text-accent'
                  }`}
                >
                  1 LST = {simulatedMarketPrice.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border pt-1.5">
                <span className="text-ink-soft">Secondary Market Discount:</span>
                <span
                  className={`font-mono font-semibold ${
                    depegAnalysis.isDepegged ? 'text-danger' : 'text-ink'
                  }`}
                >
                  -{depegAnalysis.depegDiscountPct.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Depeg Alert Banner */}
            {depegAnalysis.isDepegged ? (
              <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-red-900 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-xs text-danger">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Severe LST Depeg Detected!
                </div>
                <p className="text-[11px] leading-relaxed">
                  Traders are panic selling LST into AMM pools rather than waiting for the 1-epoch native unstaking cooldown.
                </p>
                <div className="pt-1.5 flex justify-between items-center text-xs font-medium text-emerald-800">
                  <span>Patient Arbitrageur Yield:</span>
                  <span className="font-mono">+{depegAnalysis.arbitrageProfitPct.toFixed(2)}% Instant Spread</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-accent-light/50 border border-accent/30 text-emerald-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span>Peg is healthy. Arbitrage bots keep DEX prices tightly anchored to pool reserves.</span>
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMarketDiscountPct(marketDiscountPct === 0 ? 8 : 0)}
            className="w-full gap-2 text-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            {marketDiscountPct === 0 ? 'Trigger Panic Market Sell-Off' : 'Restore Market Liquidity'}
          </Button>
        </Card>
      )}

      {/* What Just Happened? */}
      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {activeTab === 'calculator'
              ? `Staking ${stakeSOL} SOL at a net ${(yieldResult.netAPY * 100).toFixed(2)}% APY (after the ${validatorCommissionPct}% validator cut) compounds to ${totalCompoundedSOL.toFixed(2)} SOL after ${years} ${years === 1 ? 'year' : 'years'} - that is ${totalEarnedSOL.toFixed(2)} SOL of pure issuance reward, credited automatically every epoch.`
              : depegAnalysis.isDepegged
              ? `Panic sellers pushed 1 LST to ${simulatedMarketPrice.toFixed(4)} SOL on the DEX while protocol redemption is worth ${fairLSTRate.toFixed(4)} SOL - a -${depegAnalysis.depegDiscountPct.toFixed(2)}% discount. Patients buy the dip, redeem at the protocol rate, and pocket +${depegAnalysis.arbitrageProfitPct.toFixed(2)}%.`
              : `The peg is healthy: the DEX price (${simulatedMarketPrice.toFixed(4)} SOL) tracks the true redemption rate (${fairLSTRate.toFixed(4)} SOL). Arbitrage bots buy any dip and redeem it at par, which is exactly what keeps LSTs glued to their protocol value.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
