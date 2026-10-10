'use client';

import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  getUtilizationRate,
  getBorrowAPR,
  getSupplyAPR,
  generateRateCurvePoints,
  DEFAULT_LENDING_CONFIG,
} from '@defi-mommy/sim-core';
import {
  TrendingUp,
  AlertOctagon,
  ShieldAlert,
  Percent,
  Coins,
  DollarSign,
  HelpCircle,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function MoneyMarketLab() {
  const [deposits, setDeposits] = useState(500000);
  const [borrows, setBorrows] = useState(375000);
  const [userDeposit, setUserDeposit] = useState(5000);
  const [isTourActive, setIsTourActive] = useState(false);

  const handleReset = () => {
    setDeposits(500000);
    setBorrows(375000);
    setUserDeposit(5000);
  };

  // Utilization & Rates
  const utilization = useMemo(() => getUtilizationRate(deposits, borrows), [deposits, borrows]);
  const borrowAPR = useMemo(() => getBorrowAPR(utilization, DEFAULT_LENDING_CONFIG), [utilization]);
  const supplyAPR = useMemo(
    () => getSupplyAPR(utilization, borrowAPR, DEFAULT_LENDING_CONFIG.reserveFactor),
    [utilization, borrowAPR]
  );
  // Compounded daily APY
  const supplyAPY = useMemo(() => Math.pow(1 + supplyAPR / 365, 365) - 1, [supplyAPR]);

  // Curve data points for SVG chart
  const curvePoints = useMemo(() => generateRateCurvePoints(DEFAULT_LENDING_CONFIG, 40), []);

  // Protocol reserves earned
  const annualProtocolCut = borrows * borrowAPR * DEFAULT_LENDING_CONFIG.reserveFactor;

  // Personal earnings
  const userAnnualYield = userDeposit * supplyAPY;
  const userDailyYield = userAnnualYield / 365;

  // Chart coordinates (Width: 400, Height: 180, Margins: 25)
  const chartW = 380;
  const chartH = 150;
  const maxRate = 0.85; // 85% max Y-axis

  const borrowPath = useMemo(() => {
    return curvePoints
      .map((p, idx) => {
        const x = p.utilization * chartW;
        const y = chartH - (p.borrowAPR / maxRate) * chartH;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [curvePoints]);

  const supplyPath = useMemo(() => {
    return curvePoints
      .map((p, idx) => {
        const x = p.utilization * chartW;
        const y = chartH - (p.supplyAPR / maxRate) * chartH;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [curvePoints]);

  // Current utilization marker on chart
  const currentX = utilization * chartW;
  const currentBorrowY = chartH - (borrowAPR / maxRate) * chartH;
  const currentSupplyY = chartH - (supplyAPR / maxRate) * chartH;
  const kinkX = DEFAULT_LENDING_CONFIG.optimalUtilization * chartW;

  const tourSteps = [
    {
      target: '[data-tour="market-metrics"]',
      title: 'Real-Time Pool Dynamics',
      text: 'View live Utilization Rate, Borrow APR, and Depositor Supply APY. Watch how they dynamically fluctuate as liquidity moves.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="kink-curve"]',
      title: 'The Kinked Interest Rate Curve',
      text: 'Notice the bend at 80% optimal utilization! Below 80%, rates are cheap. Above 80%, rates spike exponentially to protect pool liquidity.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="market-controls"]',
      title: 'Simulate Market Forces',
      text: 'Drag Total Deposits and Borrows to test how real liquidity pools respond under different supply and demand pressures.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="stress-scenarios"]',
      title: 'Instant Stress Tests',
      text: 'Click Bank Run to see what happens when borrowers drain liquidity past the kink threshold!',
      side: 'top' as const,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent">PRO MONEY MARKET LAB</Badge>
            <span className="text-xs font-mono text-ink-soft">Aave / Kamino Kink Model</span>
          </div>
          <h2 className="font-heading font-bold text-2xl text-ink">
            Lending, Borrowing & Utilization Curves
          </h2>
          <p className="text-xs text-ink-soft">
            Explore how algorithmic interest rates automatically equilibrate supply and demand.
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

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTourActive(true)}
            className="gap-1.5 text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            Spotlight Tour
          </Button>
          <Button
            data-tour="market-reset"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Real-Time Metrics Bar */}
      <div data-tour="market-metrics" className="grid grid-cols-3 gap-3">
        {/* Utilization */}
        <Card className="p-3.5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-1">
          <div className="flex justify-between items-center text-[11px] font-semibold text-ink-soft">
            <span>Utilization (U)</span>
            {utilization > 0.80 ? (
              <Badge variant="danger" className="text-[9px] px-1 py-0">Above Kink</Badge>
            ) : (
              <Badge variant="accent" className="text-[9px] px-1 py-0">Optimal</Badge>
            )}
          </div>
          <div className="font-mono font-semibold text-2xl text-ink">
            {(utilization * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                utilization > 0.85
                  ? 'bg-red-500'
                  : utilization > 0.80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, utilization * 100)}%` }}
            />
          </div>
        </Card>

        {/* Borrow APR */}
        <Card className="p-3.5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-1">
          <div className="text-[11px] font-semibold text-ink-soft">Borrow APR</div>
          <div
            className={`font-mono font-semibold text-2xl ${
              borrowAPR > 0.15 ? 'text-red-600' : 'text-accent'
            }`}
          >
            {(borrowAPR * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-ink-soft">Cost for borrowers</div>
        </Card>

        {/* Supply APY */}
        <Card className="p-3.5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-1">
          <div className="text-[11px] font-semibold text-ink-soft">Supply APY</div>
          <div className="font-mono font-semibold text-2xl text-emerald-600">
            {(supplyAPY * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-ink-soft">Compounded daily</div>
        </Card>
      </div>

      {/* SVG Kink Curve Visualization */}
      <Card
        data-tour="kink-curve"
        className="p-5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-4"
      >
        <div className="flex justify-between items-center text-xs">
          <div>
            <h4 className="font-heading font-bold text-sm text-ink flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent" />
              Piecewise Interest Rate Curve
            </h4>
            <p className="text-[11px] text-ink-soft">
              Kink Point: 80% Optimal Utilization | Base Rate: 2.0%
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Borrow APR
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Supply APR
            </span>
          </div>
        </div>

        {/* SVG Graphic Container */}
        <div className="relative bg-bg rounded-xl p-4 border border-border">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Grid Lines */}
            <line x1="0" y1={chartH} x2={chartW} y2={chartH} stroke="#E4E3F5" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2={chartH} stroke="#E4E3F5" strokeWidth="1" />

            {/* Optimal Kink Dotted Line */}
            <line
              x1={kinkX}
              y1="0"
              x2={kinkX}
              y2={chartH}
              stroke="#F5A524"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Borrow APR Curve */}
            <path d={borrowPath} fill="none" stroke="#6D5EF5" strokeWidth="2.5" />

            {/* Supply APR Curve */}
            <path d={supplyPath} fill="none" stroke="#10B981" strokeWidth="2.5" />

            {/* Current Utilization Line */}
            <line
              x1={currentX}
              y1="0"
              x2={currentX}
              y2={chartH}
              stroke="#1B1B2F"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />

            {/* Current Position Marker Points */}
            <circle cx={currentX} cy={currentBorrowY} r="5" fill="#6D5EF5" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx={currentX} cy={currentSupplyY} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          </svg>

          {/* SVG Overlay Labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-ink-soft pt-2">
            <span>0% (Empty)</span>
            <span className="text-amber-700 font-bold">80% Kink (Optimal Target)</span>
            <span>100% (Drained)</span>
          </div>
        </div>

        {/* Explanatory Callout */}
        {utilization > 0.80 ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Liquidity Squeeze Detected! </span>
              At {(utilization * 100).toFixed(1)}% utilization, borrowers have almost emptied the
              pool. The curve spikes borrow APR to {(borrowAPR * 100).toFixed(1)}% to penalize
              borrowers and entice new depositors with a juicy {(supplyAPY * 100).toFixed(1)}% APY.
            </div>
          </div>
        ) : (
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-xs text-ink flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Normal Operating Band: </span>
              Below the 80% kink, borrowing rates remain low and stable ({(borrowAPR * 100).toFixed(1)}%).
              Depositors receive steady yield without risk of liquidity shortage.
            </div>
          </div>
        )}
      </Card>

      {/* Interactive Controls & Stress Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pool Reserve Controls */}
        <Card
          data-tour="market-controls"
          className="p-5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-4"
        >
          <h4 className="font-heading font-bold text-sm text-ink flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-accent" />
            Pool Capital Sliders
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-ink-soft mb-1">
                <span>Total Pool Deposits</span>
                <span className="font-mono font-bold text-ink">${deposits.toLocaleString()} USDC</span>
              </div>
              <input
                type="range"
                min="100000"
                max="1000000"
                step="25000"
                value={deposits}
                onChange={(e) => setDeposits(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-ink-soft mb-1">
                <span>Total Pool Borrows</span>
                <span className="font-mono font-bold text-ink">${borrows.toLocaleString()} USDC</span>
              </div>
              <input
                type="range"
                min="50000"
                max={deposits}
                step="25000"
                value={Math.min(borrows, deposits)}
                onChange={(e) => setBorrows(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>

          {/* Quick Stress Test Buttons */}
          <div data-tour="stress-scenarios" className="pt-2 border-t border-border space-y-2">
            <div className="text-[11px] font-bold uppercase text-ink-soft">Test Scenarios:</div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDeposits(500000);
                  setBorrows(300000); // 60%
                }}
                className="text-[11px] px-2 py-1"
              >
                Stable (60%)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDeposits(500000);
                  setBorrows(400000); // 80% (Kink)
                }}
                className="text-[11px] px-2 py-1"
              >
                Kink (80%)
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setDeposits(500000);
                  setBorrows(480000); // 96% (Crunch)
                }}
                className="text-[11px] px-2 py-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Bank Run (96%)
              </Button>
            </div>
          </div>

          
        </Card>

        {/* Personal Depositor ROI Calculator */}
        <Card className="p-5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-4">
          <h4 className="font-heading font-bold text-sm text-ink flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Your Deposit Earnings
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-ink-soft">
              <span>Your Deposit Amount:</span>
              <span className="font-mono font-bold text-ink">${userDeposit.toLocaleString()} USDC</span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={userDeposit}
              onChange={(e) => setUserDeposit(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="p-3.5 bg-bg rounded-xl border border-border space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-soft">Daily Earning:</span>
              <span className="font-mono font-bold text-emerald-600">
                +${userDailyYield.toFixed(2)} USDC / day
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-soft">Annual Compound Yield:</span>
              <span className="font-mono font-bold text-emerald-600">
                +${userAnnualYield.toFixed(2)} USDC / yr
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-ink-soft pt-1 border-t border-border">
              <span>Protocol Treasury Cut (15%):</span>
              <span className="font-mono text-ink">
                ${annualProtocolCut.toFixed(0)}/yr
              </span>
            </div>
          </div>

          <p className="text-[11px] text-ink-soft italic leading-relaxed">
            Unlike static bank accounts, DeFi money market yields fluctuate block-by-block based on
            real protocol utilization.
          </p>
        </Card>
      </div>

      {/* What Just Happened? */}
      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {utilization > 0.8
              ? `Utilization blasted past the 80% kink to ${(utilization * 100).toFixed(1)}%! The pool is nearly drained, so the curve spikes borrow APR to ${(borrowAPR * 100).toFixed(2)}% and rewards depositors with ${(supplyAPY * 100).toFixed(2)}% APY - punishing borrowers and auctioning yield to attract fresh deposits. That reflex is what keeps the protocol solvent.`
              : `Utilization is ${(utilization * 100).toFixed(1)}%, below the 80% kink. Borrowers pay ${(borrowAPR * 100).toFixed(2)}% and depositors earn ${(supplyAPY * 100).toFixed(2)}% APY from idle liquidity - the healthy, stable operating band. Your ${userDeposit.toLocaleString()} USDC deposit compounds to +$${userDailyYield.toFixed(2)}/day and +$${userAnnualYield.toFixed(2)}/yr at this rate.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
