'use client';

import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  getHealthFactor,
  getLiquidationPrice,
  simulateLiquidation,
  LoanPosition,
} from '@defi-mommy/sim-core';
import {
  AlertTriangle,
  Zap,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  Skull,
  ShieldCheck,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function LiquidationLab() {
  const [solPrice, setSolPrice] = useState(200);
  const [collateralAmount, setCollateralAmount] = useState(10); // 10 SOL
  const [borrowedDebt, setBorrowedDebt] = useState(1200); // 1,200 USDC
  const [liquidationLog, setLiquidationLog] = useState<{
    debtRepaid: number;
    collateralSeized: number;
    profitUSD: number;
    timestamp: string;
  } | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  const liquidationThreshold = 0.80; // 80%
  const maxLTV = 0.75; // 75%
  const liquidationBonus = 0.05; // 5%

  const position: LoanPosition = useMemo(
    () => ({
      collateralAmount,
      collateralPrice: solPrice,
      borrowedDebt,
      liquidationThreshold,
      maxLTV,
      liquidationBonus,
    }),
    [collateralAmount, solPrice, borrowedDebt]
  );

  const healthFactor = useMemo(() => getHealthFactor(position), [position]);
  const liquidationPrice = useMemo(() => getLiquidationPrice(position), [position]);

  const collateralValueUSD = collateralAmount * solPrice;
  const currentLTV = collateralValueUSD > 0 ? (borrowedDebt / collateralValueUSD) : 0;
  const isLiquidatable = healthFactor < 1.0;

  const handleTriggerLiquidation = () => {
    if (!isLiquidatable) return;

    const result = simulateLiquidation(position, 0.50);
    if (result.isLiquidatable) {
      setCollateralAmount(Number(result.remainingCollateral.toFixed(3)));
      setBorrowedDebt(Number(result.remainingDebt.toFixed(2)));
      setLiquidationLog({
        debtRepaid: result.debtRepaid,
        collateralSeized: result.collateralSeized,
        profitUSD: result.liquidatorProfitUSD,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const handleReset = () => {
    setSolPrice(200);
    setCollateralAmount(10);
    setBorrowedDebt(1200);
    setLiquidationLog(null);
  };

  const tourSteps = [
    {
      target: '[data-tour="health-factor"]',
      title: 'Health Factor (HF)',
      text: 'The single most vital metric in DeFi lending. If HF drops below 1.0, your collateral is seized to repay lenders.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="price-slider"]',
      title: 'Crash the Market',
      text: 'Drag the SOL price slider down to simulate market volatility and watch the Health Factor deteriorate.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="liquidation-trigger"]',
      title: 'Execute Liquidation Bot',
      text: 'When HF falls below 1.0, arbitrage bots automatically step in to repay debt, seize collateral, and collect a 5% bonus.',
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
            <Badge variant="accent">LIQUIDATION & RISK LAB</Badge>
            <span className="text-xs font-mono text-ink-soft">Lesson I7 · Lab Simulator</span>
          </div>
          <h2 className="font-heading font-bold text-2xl text-ink">
            Collateral, Health Factor & Liquidation
          </h2>
          <p className="text-xs text-ink-soft">
            Experience how automated liquidator bots protect protocols from bad debt.
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

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTourActive(true)}
            className="gap-1.5 text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            Spotlight Tour
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Health Factor & Risk Bar */}
      <div data-tour="health-factor" className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Health Factor Gauge */}
        <Card
          className={`p-4 border-2 transition-all ${
            healthFactor < 1.0
              ? 'bg-red-50 border-red-500 shadow-sm'
              : healthFactor < 1.3
              ? 'bg-amber-50 border-amber-400'
              : 'bg-surface border-border'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-semibold text-ink-soft">
            <span>Health Factor (HF)</span>
            {healthFactor < 1.0 ? (
              <Badge variant="danger" className="text-[10px] animate-pulse">
                UNDERWATER
              </Badge>
            ) : healthFactor < 1.3 ? (
              <Badge variant="warn" className="text-[10px]">
                RISK ZONE
              </Badge>
            ) : (
              <Badge variant="accent" className="text-[10px]">
                HEALTHY
              </Badge>
            )}
          </div>
          <div
            className={`font-mono font-semibold text-3xl mt-1 ${
              healthFactor < 1.0
                ? 'text-red-600'
                : healthFactor < 1.3
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {healthFactor > 10 ? '>10.0' : healthFactor.toFixed(2)}
          </div>
          <div className="text-[10px] text-ink-soft mt-1">Liquidation Trigger at &lt; 1.00</div>
        </Card>

        {/* Liquidation Threshold Price */}
        <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-1">
          <div className="text-xs font-semibold text-ink-soft">Liquidation Price</div>
          <div className="font-mono font-semibold text-2xl text-ink">
            ${liquidationPrice.toFixed(2)}
          </div>
          <div className="text-[10px] text-ink-soft">
            If SOL drops below this, you get liquidated!
          </div>
        </Card>

        {/* Current Loan to Value */}
        <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-1">
          <div className="text-xs font-semibold text-ink-soft">Current LTV</div>
          <div className="font-mono font-semibold text-2xl text-accent">
            {(currentLTV * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-ink-soft">
            Max Borrow Limit: {(maxLTV * 100).toFixed(0)}%
          </div>
        </Card>
      </div>

      {/* Interactive Price Crash Simulator Slider */}
      <Card
        data-tour="price-slider"
        className="p-5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-heading font-bold text-sm text-ink flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-accent" />
              Simulate Market Volatility: SOL Price
            </h4>
            <p className="text-xs text-ink-soft">
              Drag to see the live impact of market downturns on loan collateral.
            </p>
          </div>
          <div className="font-mono font-semibold text-2xl text-ink">
            ${solPrice.toFixed(2)} <span className="text-xs text-ink-soft">/ SOL</span>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="70"
            max="260"
            step="2"
            value={solPrice}
            onChange={(e) => setSolPrice(Number(e.target.value))}
            className="w-full accent-accent h-2 bg-border rounded-lg"
          />
          <div className="flex justify-between text-[11px] font-mono text-ink-soft">
            <span className="text-red-600 font-bold">$70 (Market Crash)</span>
            <span className="text-amber-600 font-bold">${liquidationPrice.toFixed(0)} (Liq Point)</span>
            <span className="text-emerald-600 font-bold">$260 (Bull Market)</span>
          </div>
        </div>

        {/* Position Summary Cards */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-bg rounded-xl border border-border space-y-1">
            <div className="text-ink-soft">Collateral Deposited</div>
            <div className="font-mono font-bold text-ink text-sm">
              {collateralAmount.toFixed(2)} SOL (${collateralValueUSD.toFixed(2)})
            </div>
          </div>
          <div className="p-3 bg-bg rounded-xl border border-border space-y-1">
            <div className="text-ink-soft">Debt Borrowed</div>
            <div className="font-mono font-bold text-ink text-sm">
              ${borrowedDebt.toFixed(2)} USDC
            </div>
          </div>
        </div>
      </Card>

      {/* Liquidation Action Box */}
      <Card
        data-tour="liquidation-trigger"
        className={`p-5 border-2 transition-all ${
          isLiquidatable
            ? 'bg-red-500/10 border-red-500 shadow-md'
            : 'bg-surface border-border'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isLiquidatable ? (
                <Skull className="w-5 h-5 text-red-600 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              )}
              <h4 className="font-heading font-bold text-base text-ink">
                {isLiquidatable ? 'Position Underwater! Ready for Liquidation' : 'Position Protected'}
              </h4>
            </div>
            <p className="text-xs text-ink-soft max-w-md">
              {isLiquidatable
                ? 'Liquidator bots monitor the mempool 24/7. Anyone can trigger this transaction, repay the debt, and pocket a 5% collateral bonus!'
                : `Health Factor is above 1.00. Drag SOL price below $${liquidationPrice.toFixed(2)} to trigger liquidation.`}
            </p>
          </div>

          <Button
            variant={isLiquidatable ? 'accent' : 'secondary'}
            disabled={!isLiquidatable}
            onClick={handleTriggerLiquidation}
            className={`gap-2 shrink-0 ${
              isLiquidatable ? 'bg-red-600 hover:bg-red-700 text-white font-bold' : ''
            }`}
          >
            <Zap className="w-4 h-4" />
            {isLiquidatable ? ' Execute Liquidation Bot' : 'Bot Idle (HF > 1.0)'}
          </Button>
        </div>

        {/* Liquidation Execution Log */}
        {liquidationLog && (
          <div className="mt-4 p-4 rounded-xl bg-surface border border-red-200 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 font-bold text-red-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Liquidation Executed at {liquidationLog.timestamp}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-ink-soft block">Debt Repaid:</span>
                <span className="font-bold text-ink">${liquidationLog.debtRepaid.toFixed(2)} USDC</span>
              </div>
              <div>
                <span className="text-ink-soft block">Collateral Seized:</span>
                <span className="font-bold text-red-600">
                  {liquidationLog.collateralSeized.toFixed(3)} SOL
                </span>
              </div>
              <div>
                <span className="text-ink-soft block">Liquidator Profit:</span>
                <span className="font-bold text-emerald-600">
                  +${liquidationLog.profitUSD.toFixed(2)} USDC (5%)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-ink-soft pt-1 border-t border-border">
              Notice how the bot took 5% extra collateral as compensation. The loan's remaining
              health factor has improved, protecting protocol solvency.
            </p>
          </div>
        )}
      </Card>

      {/* What Just Happened? */}
      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {liquidationLog
              ? `The liquidation bot repaid $${liquidationLog.debtRepaid.toFixed(2)} of debt and seized ${liquidationLog.collateralSeized.toFixed(3)} SOL, pocketing +$${liquidationLog.profitUSD.toFixed(2)} as the 5% bonus. Your remaining loan is safer now - but it only got here because the health factor fell below 1.0.`
              : healthFactor < 1.0
              ? `Your health factor is ${healthFactor.toFixed(2)} - below 1.0 your position is underwater. Right now anyone on the internet can fire a bot that repays your debt and seizes your collateral at a discount. Safety happens BEFORE the price reaches $${liquidationPrice.toFixed(2)}.`
              : healthFactor < 1.3
              ? `Health factor ${healthFactor.toFixed(2)} - you are in the risk zone. SOL only has to fall from $${solPrice.toFixed(2)} to $${liquidationPrice.toFixed(2)} to put you underwater against ${(currentLTV * 100).toFixed(1)}% LTV.`
              : `Health factor ${healthFactor.toFixed(2)} with LTV at ${(currentLTV * 100).toFixed(1)}% - a comfortable buffer above the 1.0 trigger. Your collateral backs the debt several times over, which is exactly why lenders are willing to lend.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
