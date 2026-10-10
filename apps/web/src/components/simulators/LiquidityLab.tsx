'use client';

import React, { useState, useMemo } from 'react';
import { Card, Button, Slider, Badge } from '@/components/ui';
import { simulateSwap, getSpotPrice } from '@defi-mommy/sim-core';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export interface LiquidityLabProps {
  onGoalAchieved?: () => void;
  className?: string;
}

export function LiquidityLab({ onGoalAchieved, className }: LiquidityLabProps) {
  // Pool mode: 'shallow' (low liquidity) or 'deep' (high liquidity)
  const [poolType, setPoolType] = useState<'shallow' | 'deep'>('shallow');
  const [tradeAmount, setTradeAmount] = useState<number>(50); // fUSDC
  const [showComparison, setShowComparison] = useState<boolean>(true);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Pool configurations:
  // Shallow Pool: 10 SOL, 2,000 fUSDC ($200/SOL spot price, $4,000 total TVL)
  // Deep Ocean Pool: 1,000 SOL, 200,000 fUSDC ($200/SOL spot price, $400,000 total TVL)
  const shallowReserves = { sol: 10, usdc: 2000 };
  const deepReserves = { sol: 1000, usdc: 200000 };

  const currentReserves = poolType === 'shallow' ? shallowReserves : deepReserves;

  // Swap calculation: swapping fUSDC (token B) for SOL (token A)
  // simulateSwap(amountIn, reserveA, reserveB, aToB = false, fee = 0.003)
  const swapResult = useMemo(() => {
    return simulateSwap(
      tradeAmount,
      currentReserves.sol,
      currentReserves.usdc,
      false, // B -> A (fUSDC to SOL)
      0.003
    );
  }, [tradeAmount, currentReserves]);

  // Comparison swap on the opposite pool for side-by-side comparison
  const comparisonSwapResult = useMemo(() => {
    const oppReserves = poolType === 'shallow' ? deepReserves : shallowReserves;
    return simulateSwap(
      tradeAmount,
      oppReserves.sol,
      oppReserves.usdc,
      false,
      0.003
    );
  }, [tradeAmount, poolType]);

  const spotPrice = getSpotPrice(currentReserves.sol, currentReserves.usdc); // 200 fUSDC per SOL
  const impactPct = swapResult.priceImpact * 100;

  const handlePoolToggle = (type: 'shallow' | 'deep') => {
    setPoolType(type);
    setHasInteracted(true);
    if (type === 'deep' && onGoalAchieved) {
      onGoalAchieved();
    }
  };

  const handleReset = () => {
    setPoolType('shallow');
    setTradeAmount(50);
    setShowComparison(true);
  };

  // SVG Curve generation for constant product x * y = k
  const curvePoints = useMemo(() => {
    const k = currentReserves.sol * currentReserves.usdc;
    const points: { x: number; y: number }[] = [];
    const minSol = currentReserves.sol * 0.4;
    const maxSol = currentReserves.sol * 2.2;
    const steps = 30;

    for (let i = 0; i <= steps; i++) {
      const solVal = minSol + (i / steps) * (maxSol - minSol);
      const usdcVal = k / solVal;
      // Map to SVG viewBox 0..240 (x) and 0..160 (y)
      const svgX = 20 + (i / steps) * 200;
      const normalizedY =
        140 - ((usdcVal - currentReserves.usdc * 0.4) / (currentReserves.usdc * 2.5)) * 110;
      points.push({ x: svgX, y: Math.max(15, Math.min(145, normalizedY)) });
    }
    return points;
  }, [currentReserves]);

  const pathD = curvePoints.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  // Trade point on curve
  const tradeX = 20 + 0.5 * 200;
  const tradeY =
    140 - ((currentReserves.usdc - currentReserves.usdc * 0.4) / (currentReserves.usdc * 2.5)) * 110;

  const tourSteps = [
    {
      target: '[data-tour="pool-selector"]',
      title: 'Pool Depth Toggle',
      text: 'This is the whole lesson in two buttons. Toggle between a Shallow pool ($4,000 TVL) and an Ocean Deep pool ($400,000 TVL) and watch how extra depth absorbs your trade like a sponge.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="trade-slider"]',
      title: 'Trade Size Slider',
      text: 'Drag this to set how many fUSDC you are swapping. The trick: compare YOUR trade size to the pool size. A big order into a small pool is what causes painful slippage.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="price-impact-box"]',
      title: 'Price Impact Gauge',
      text: 'This readout is the hidden tax. In the shallow pool it explodes into double digits; in the deep pool it stays under 0.01%. Same trade, wildly different cost - that is the power of liquidity depth.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="bonding-curve"]',
      title: 'Constant Product Curve (x · y = k)',
      text: 'The hyperbola is the AMM formula drawn out. The dot is your trade walking along the curve - the further it slides, the worse your price gets.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="comparison-card"]',
      title: 'Side-by-Side Comparison',
      text: 'The showdown: the exact same dollar trade against both pools at once. Read the two "you receive" lines and you will never trade blindly into a thin pool again.',
      side: 'top' as const,
    },
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-5 ${className || ''}`}>
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-xl text-ink">
              Liquidity Lab Simulator
            </h3>
            <span className="text-[10px] font-mono text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
              Model: x · y = k
            </span>
          </div>
          <p className="text-xs text-ink-soft mt-0.5">
            Test how pool depth cushions trade prices against catastrophic price impact.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTourActive(true)}
            className="gap-1.5 text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-accent" /> Tour
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Pool Selector Tabs (Shallow vs Deep) */}
      <div data-tour="pool-selector" className="grid grid-cols-2 gap-3 p-1.5 bg-border/40 rounded-xl">
        <button
          type="button"
          onClick={() => handlePoolToggle('shallow')}
          className={`py-3 px-4 rounded-lg font-heading font-bold text-xs transition-all flex flex-col items-center gap-1 ${
            poolType === 'shallow'
              ? 'bg-surface text-ink shadow-sm ring-2 ring-warn/50'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warn" />
            <span>Shallow Pool (Low Liquidity)</span>
          </div>
          <span className="text-[11px] font-mono font-normal text-ink-soft">
            10 SOL / 2,000 fUSDC ($4,000 TVL)
          </span>
        </button>

        <button
          type="button"
          onClick={() => handlePoolToggle('deep')}
          className={`py-3 px-4 rounded-lg font-heading font-bold text-xs transition-all flex flex-col items-center gap-1 ${
            poolType === 'deep'
              ? 'bg-surface text-ink shadow-sm ring-2 ring-accent/50'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span>Deep Ocean Pool (High Liquidity)</span>
          </div>
          <span className="text-[11px] font-mono font-normal text-ink-soft">
            1,000 SOL / 200,000 fUSDC ($400,000 TVL)
          </span>
        </button>
      </div>

      {/* Main Grid: Controls vs Curve Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Controls & Metrics */}
        <Card className="p-5 space-y-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg">
          <div data-tour="trade-slider">
            <Slider
              label="Trade Size (fUSDC to swap)"
              value={tradeAmount}
              min={10}
              max={500}
              step={10}
              unit="fUSDC"
              onChange={(val) => {
                setTradeAmount(val);
                setHasInteracted(true);
              }}
            />
          </div>

          <div data-tour="price-impact-box" className="p-3.5 rounded-xl bg-bg border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Spot Price (p₀):</span>
              <span className="font-mono font-bold text-ink">
                1 SOL = ${spotPrice.toFixed(2)} fUSDC
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Estimated SOL Received:</span>
              <span className="font-mono font-bold text-accent text-sm">
                {swapResult.amountOut.toFixed(4)} SOL
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-ink-soft">0.3% LP Trading Fee:</span>
              <span className="font-mono text-ink-soft">
                {swapResult.feeAmount.toFixed(2)} fUSDC
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-heading font-semibold text-ink">Price Impact:</span>
              <span
                className={`font-mono font-bold text-sm px-2 py-0.5 rounded-md ${
                  impactPct < 1
                    ? 'bg-quaternary/30 text-emerald-900'
                    : impactPct < 5
                    ? 'bg-tertiary/30 text-amber-900'
                    : 'bg-red-50 text-red-900'
                }`}
              >
                {impactPct < 0.01 ? '<0.01%' : `${impactPct.toFixed(2)}%`}
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="w-full gap-2 text-xs"
          >
            <Layers className="w-3.5 h-3.5 text-accent" />
            {showComparison ? 'Hide Side-by-Side Comparison' : 'Compare Side-by-Side'}
          </Button>
        </Card>

        {/* Live SVG Curve & Buckets */}
        <Card data-tour="bonding-curve" className="p-5 flex flex-col justify-between space-y-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
              Bonding Curve (x · y = k)
            </span>
            <Badge
              variant={poolType === 'deep' ? 'accent' : 'warn'}
              className="text-[10px]"
            >
              {poolType === 'deep' ? 'Deep Depth' : 'Shallow Depth'}
            </Badge>
          </div>

          {/* SVG Visual */}
          <div className="w-full h-44 bg-bg rounded-xl border border-border relative flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 240 160"
              className="w-full h-full p-2"
              preserveAspectRatio="none"
            >
              {/* Axes */}
              <line x1="20" y1="145" x2="230" y2="145" stroke="var(--border)" strokeWidth="2" />
              <line x1="20" y1="15" x2="20" y2="145" stroke="var(--border)" strokeWidth="2" />

              {/* Curve */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Current Trade Dot */}
              <circle
                cx={tradeX}
                cy={tradeY}
                r="6"
                fill="var(--accent)"
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>

            {/* Labels */}
            <span className="absolute bottom-1 right-3 text-[10px] font-mono text-ink-soft">
              SOL Reserve (x)
            </span>
            <span className="absolute top-2 left-3 text-[10px] font-mono text-ink-soft">
              fUSDC Reserve (y)
            </span>
          </div>

          {/* Pool Reserve Buckets Indicator */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <span className="text-[10px] text-ink-soft block">SOL in Vault</span>
              <span className="font-mono font-bold text-ink">
                {currentReserves.sol.toLocaleString()} SOL
              </span>
            </div>
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <span className="text-[10px] text-ink-soft block">fUSDC in Vault</span>
              <span className="font-mono font-bold text-ink">
                ${currentReserves.usdc.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Side-by-Side Comparison Box */}
      {showComparison && (
        <Card data-tour="comparison-card" className="p-5 bg-accent/10 border-accent/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-accent font-heading font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Side-by-Side Comparison: Same {tradeAmount} fUSDC Trade</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warn" /> Shallow Pool ($4,000 TVL)
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">You receive:</span>
                <span className="font-mono font-bold">
                  {(poolType === 'shallow' ? swapResult : comparisonSwapResult).amountOut.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Price impact:</span>
                <span className="font-mono font-bold text-red-600">
                  {((poolType === 'shallow' ? swapResult : comparisonSwapResult).priceImpact * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-accent/40 space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" /> Deep Ocean Pool ($400,000 TVL)
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">You receive:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {(poolType === 'deep' ? swapResult : comparisonSwapResult).amountOut.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Price impact:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {((poolType === 'deep' ? swapResult : comparisonSwapResult).priceImpact * 100 < 0.01
                    ? '<0.01%'
                    : `${((poolType === 'deep' ? swapResult : comparisonSwapResult).priceImpact * 100).toFixed(2)}%`)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* "What Just Happened?" Educational Callout Card */}
      {hasInteracted && (
        <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
            <p className="text-ink-soft leading-relaxed">
              When trading into the <strong>{poolType === 'deep' ? 'Deep Ocean' : 'Shallow'} Pool</strong>,
              your {tradeAmount} fUSDC trade caused a price impact of{' '}
              <strong className="text-ink">{impactPct.toFixed(2)}%</strong>.
              In deep pools, trades are an insignificant drop in the bucket, protecting your value from slippage.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
