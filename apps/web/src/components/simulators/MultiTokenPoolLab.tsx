'use client';

import React, { useState, useMemo } from 'react';
import { Card, Button, Slider, Badge } from '@/components/ui';
import { simulateSwap, getSpotPrice } from '@defi-mommy/sim-core';
import {
  RotateCcw,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  Coins,
  Check,
  RefreshCw,
  ExternalLink,
  Info,
  DollarSign,
  Zap,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export interface MultiTokenPoolLabProps {
  onGoalAchieved?: () => void;
  className?: string;
}

interface PoolTokenPair {
  id: string;
  name: string;
  tokenX: string;
  tokenY: string;
  initialX: number;
  initialY: number;
  decimalsX: number;
  decimalsY: number;
  xUsdPrice: number;
  yUsdPrice: number;
  description: string;
}

const TOKEN_PAIRS: PoolTokenPair[] = [
  {
    id: 'sol-fusdc',
    name: 'SOL / fUSDC',
    tokenX: 'SOL',
    tokenY: 'fUSDC',
    initialX: 1000,
    initialY: 200000,
    decimalsX: 9,
    decimalsY: 6,
    xUsdPrice: 200,
    yUsdPrice: 1,
    description: 'Deep premier pool: 1,000 SOL & 200,000 fUSDC ($400,000 TVL).',
  },
  {
    id: 'sol-bonk',
    name: 'SOL / BONK',
    tokenX: 'SOL',
    tokenY: 'BONK',
    initialX: 100,
    initialY: 3000000000, // 3 Billion BONK
    decimalsX: 9,
    decimalsY: 5,
    xUsdPrice: 200,
    yUsdPrice: 0.00000667,
    description: 'High-volatility meme pair: 100 SOL & 3 Billion BONK.',
  },
  {
    id: 'fusdc-ray',
    name: 'fUSDC / RAY',
    tokenX: 'RAY',
    tokenY: 'fUSDC',
    initialX: 40000,
    initialY: 100000,
    decimalsX: 6,
    decimalsY: 6,
    xUsdPrice: 2.50,
    yUsdPrice: 1,
    description: 'DeFi governance pair: 40,000 RAY & 100,000 fUSDC ($2.50/RAY).',
  },
  {
    id: 'sol-jup',
    name: 'SOL / JUP',
    tokenX: 'JUP',
    tokenY: 'SOL',
    initialX: 83333,
    initialY: 500,
    decimalsX: 6,
    decimalsY: 9,
    xUsdPrice: 1.20,
    yUsdPrice: 200,
    description: 'DEX aggregator pair: 83,333 JUP & 500 SOL (~0.006 SOL/JUP).',
  },
];

export interface MultiTokenPoolLabProps {
  onGoalAchieved?: () => void;
  className?: string;
}

export function MultiTokenPoolLab({ onGoalAchieved, className }: MultiTokenPoolLabProps) {
  const [selectedPairId, setSelectedPairId] = useState<string>('sol-fusdc');
  const [activePair, setActivePair] = useState<PoolTokenPair>(TOKEN_PAIRS[0]);

  // Current live pool reserves
  const [reserveX, setReserveX] = useState<number>(TOKEN_PAIRS[0].initialX);
  const [reserveY, setReserveY] = useState<number>(TOKEN_PAIRS[0].initialY);

  // Manual swap input
  const [tradeAmount, setTradeAmount] = useState<number>(100);
  const [swapDirection, setSwapDirection] = useState<'y-to-x' | 'x-to-y'>('y-to-x');

  // LP position and fee tracking
  const [userLpSharePct, setUserLpSharePct] = useState<number>(5.0); // User owns 5% of the pool
  const [unclaimedFeesX, setUnclaimedFeesX] = useState<number>(0);
  const [unclaimedFeesY, setUnclaimedFeesY] = useState<number>(0);
  const [claimedHistory, setClaimedHistory] = useState<{ totalUsd: number; txSig: string } | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  // Simulation metrics
  const [totalSimulatedTrades, setTotalSimulatedTrades] = useState<number>(0);
  const [simulationSummary, setSimulationSummary] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Switch pair handler
  const handleSelectPair = (pairId: string) => {
    const pair = TOKEN_PAIRS.find((p) => p.id === pairId) || TOKEN_PAIRS[0];
    setSelectedPairId(pairId);
    setActivePair(pair);
    setReserveX(pair.initialX);
    setReserveY(pair.initialY);
    setUnclaimedFeesX(0);
    setUnclaimedFeesY(0);
    setTotalSimulatedTrades(0);
    setSimulationSummary(null);
    setClaimedHistory(null);
  };

  // Spot price: Y per X (e.g. fUSDC per SOL)
  const spotPrice = useMemo(() => {
    return reserveX > 0 ? reserveY / reserveX : 0;
  }, [reserveX, reserveY]);

  // Constant product k
  const invariantK = useMemo(() => {
    return reserveX * reserveY;
  }, [reserveX, reserveY]);

  // Current TVL in USD
  const currentTVL = useMemo(() => {
    return (reserveX * activePair.xUsdPrice) + (reserveY * activePair.yUsdPrice);
  }, [reserveX, reserveY, activePair]);

  // Calculate live swap outcome
  const swapResult = useMemo(() => {
    const isXtoY = swapDirection === 'x-to-y';
    return simulateSwap(
      tradeAmount,
      reserveX,
      reserveY,
      isXtoY,
      0.003 // 0.3% fee
    );
  }, [tradeAmount, reserveX, reserveY, swapDirection]);

  // Execute manual single swap
  const handleExecuteManualSwap = () => {
    const isXtoY = swapDirection === 'x-to-y';
    const amountIn = tradeAmount;
    const amountOut = swapResult.amountOut;
    const fee = swapResult.feeAmount;

    if (isXtoY) {
      setReserveX((prev) => prev + amountIn);
      setReserveY((prev) => Math.max(0.001, prev - amountOut));
      // User earns their share of fee
      setUnclaimedFeesX((prev) => prev + fee * (userLpSharePct / 100));
    } else {
      setReserveY((prev) => prev + amountIn);
      setReserveX((prev) => Math.max(0.001, prev - amountOut));
      setUnclaimedFeesY((prev) => prev + fee * (userLpSharePct / 100));
    }

    setTotalSimulatedTrades((prev) => prev + 1);
    setSimulationSummary(
      `Executed 1 swap: Swapped ${amountIn} ${isXtoY ? activePair.tokenX : activePair.tokenY} for ${amountOut.toFixed(4)} ${isXtoY ? activePair.tokenY : activePair.tokenX}.`
    );

    if (onGoalAchieved) onGoalAchieved();
  };

  // Batch market volume simulation
  const handleSimulateMarketVolume = (tradeCount: number) => {
    let currentX = reserveX;
    let currentY = reserveY;
    let totalVolumeY = 0;
    let totalVolumeX = 0;
    let accumulatedFeeX = 0;
    let accumulatedFeeY = 0;

    // Simulate realistic buy/sell orders with slight buying bias
    for (let i = 0; i < tradeCount; i++) {
      // 55% buy Token X with Token Y, 45% sell Token X for Token Y
      const isBuyX = Math.random() < 0.55;
      const sizeFactor = 0.002 + Math.random() * 0.015; // 0.2% to 1.7% of pool size per trade

      if (isBuyX) {
        // In: Token Y, Out: Token X
        const inY = currentY * sizeFactor;
        const res = simulateSwap(inY, currentX, currentY, false, 0.003);
        currentY = res.newReserveB;
        currentX = res.newReserveA;
        totalVolumeY += inY;
        accumulatedFeeY += res.feeAmount;
      } else {
        // In: Token X, Out: Token Y
        const inX = currentX * sizeFactor;
        const res = simulateSwap(inX, currentX, currentY, true, 0.003);
        currentX = res.newReserveA;
        currentY = res.newReserveB;
        totalVolumeX += inX;
        accumulatedFeeX += res.feeAmount;
      }
    }

    setReserveX(currentX);
    setReserveY(currentY);
    setTotalSimulatedTrades((prev) => prev + tradeCount);

    // LP gets their share of accumulated fees
    const userEarnedX = accumulatedFeeX * (userLpSharePct / 100);
    const userEarnedY = accumulatedFeeY * (userLpSharePct / 100);
    setUnclaimedFeesX((prev) => prev + userEarnedX);
    setUnclaimedFeesY((prev) => prev + userEarnedY);

    const priceChangePct = (((currentY / currentX) - spotPrice) / spotPrice) * 100;

    setSimulationSummary(
      `Simulated ${tradeCount} trades: ${priceChangePct >= 0 ? '+' : ''}${priceChangePct.toFixed(2)}% price shift. Accumulated ${(accumulatedFeeX + accumulatedFeeY).toFixed(2)} in total pool trading fees.`
    );

    if (onGoalAchieved) onGoalAchieved();
  };

  // Claim accrued LP fees
  const handleClaimFees = () => {
    if (unclaimedFeesX <= 0 && unclaimedFeesY <= 0) return;
    setIsClaiming(true);

    const feeValueUsd = (unclaimedFeesX * activePair.xUsdPrice) + (unclaimedFeesY * activePair.yUsdPrice);

    setTimeout(() => {
      setClaimedHistory({
        totalUsd: feeValueUsd,
        txSig: `claim_${Date.now()}_sig_${Math.random().toString(36).substring(2, 8)}`,
      });
      setUnclaimedFeesX(0);
      setUnclaimedFeesY(0);
      setIsClaiming(false);
    }, 1000);
  };

  // Reset pool
  const handleResetPool = () => {
    setReserveX(activePair.initialX);
    setReserveY(activePair.initialY);
    setUnclaimedFeesX(0);
    setUnclaimedFeesY(0);
    setTotalSimulatedTrades(0);
    setSimulationSummary(null);
    setClaimedHistory(null);
  };

  // Total unclaimed USD
  const totalUnclaimedUsd = (unclaimedFeesX * activePair.xUsdPrice) + (unclaimedFeesY * activePair.yUsdPrice);

  // Annualized APY based on simulated fee pace
  const simulated24hVolumeUsd = (totalSimulatedTrades > 0 ? (totalSimulatedTrades * currentTVL * 0.05) : (currentTVL * 0.25));
  const dailyFeeUsd = simulated24hVolumeUsd * 0.003;
  const annualFeeUsd = dailyFeeUsd * 365;
  const feeApyPct = currentTVL > 0 ? (annualFeeUsd / currentTVL) * 100 : 0;

  // SVG Curve generation for constant product x * y = k
  const curvePoints = useMemo(() => {
    const k = invariantK;
    const points: { x: number; y: number }[] = [];
    const minX = activePair.initialX * 0.4;
    const maxX = activePair.initialX * 2.2;
    const steps = 30;

    for (let i = 0; i <= steps; i++) {
      const curX = minX + (i / steps) * (maxX - minX);
      const curY = k / curX;
      // map to SVG viewBox 0..260 (x) and 0..160 (y)
      const svgX = 20 + (i / steps) * 220;
      const normalizedY =
        140 - ((curY - activePair.initialY * 0.4) / (activePair.initialY * 2.5)) * 110;
      const svgY = Math.max(15, Math.min(145, normalizedY));
      points.push({ x: svgX, y: svgY });
    }
    return points;
  }, [invariantK, activePair]);

  // Current operating point on curve
  const currentPointSvg = useMemo(() => {
    const minX = activePair.initialX * 0.4;
    const maxX = activePair.initialX * 2.2;
    const ratio = Math.max(0, Math.min(1, (reserveX - minX) / (maxX - minX)));
    const svgX = 20 + ratio * 220;
    const normalizedY =
      140 - ((reserveY - activePair.initialY * 0.4) / (activePair.initialY * 2.5)) * 110;
    const svgY = Math.max(15, Math.min(145, normalizedY));
    return { x: svgX, y: svgY };
  }, [reserveX, reserveY, activePair]);

  const pathD = useMemo(() => {
    if (curvePoints.length === 0) return '';
    return curvePoints.reduce(
      (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
      ''
    );
  }, [curvePoints]);

  const tourSteps = [
    {
      target: '[data-tour="pool-selector"]',
      title: 'Multi-Token AMM Pools',
      text: 'Switch between 4 realistic token pairs (SOL/fUSDC, SOL/BONK, fUSDC/RAY, SOL/JUP) to observe how pool depth changes price volatility.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="curve-visualizer"]',
      title: 'Constant Product Curve (x·y=k)',
      text: 'Every swap moves the operating dot along this curve. When traders buy Token X, X reserve falls, Y reserve rises, and price increases!',
      side: 'left' as const,
    },
    {
      target: '[data-tour="sim-buttons"]',
      title: 'Market Volume Simulators',
      text: 'Simulate 1, 10, or 100 trades to watch real trading volume, price shifts, and fee accumulation happen in real time.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="fee-claim-card"]',
      title: 'Accrued Fees & Simulated Claiming',
      text: 'Every trade pays 0.3% to liquidity providers. Click "Claim Accrued Fees" to simulate withdrawing your share — no real wallet or funds are involved.',
      side: 'top' as const,
    },
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className || ''}`}>
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Badge variant="accent" className="mb-1">LAB I2 • LP FEE ENGINE</Badge>
          <h2 className="font-heading font-bold text-2xl text-ink">
            Multi-Pool LP Fee Accrual Lab
          </h2>
          <p className="text-xs text-ink-soft">
            Simulate real trading volume across 4 token pairs and watch 0.3% swap fees accrue to your liquidity provider share on the constant product curve (x·y=k) — then claim them.
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
            data-tour="multi-token-reset"
            variant="ghost"
            size="sm"
            onClick={handleResetPool}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Pool
          </Button>
        </div>
      </div>

      {/* Pool Selector Tabs */}
      <div data-tour="pool-selector" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TOKEN_PAIRS.map((pair) => (
          <button
            key={pair.id}
            type="button"
            onClick={() => handleSelectPair(pair.id)}
            className={`p-3 rounded-full border text-left transition-all ${
              selectedPairId === pair.id
                ? 'bg-accent text-white border-2 border-ink rounded-full shadow-pop-sm'
                : 'bg-white text-ink-soft border-2 border-border hover:border-accent/40 hover:text-ink'
            }`}
          >
            <div className="font-heading font-bold text-xs">{pair.name}</div>
            <div className="text-[10px] opacity-80 truncate">{pair.description}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Curve & Live Pool State (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Curve Visualization Card */}
          <Card data-tour="curve-visualizer" className="p-5 space-y-4 bg-white border-2 border-ink rounded-xl shadow-pop-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-soft tracking-wider">
                  Constant Product Curve Invariant
                </span>
                <div className="font-heading font-semibold text-lg text-ink">
                  x · y = k = {(invariantK / 1e6).toFixed(2)}M
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                Spot: 1 {activePair.tokenX} = {spotPrice > 10 ? spotPrice.toFixed(2) : spotPrice.toFixed(6)} {activePair.tokenY}
              </Badge>
            </div>

            {/* SVG Visualizer */}
            <div className="relative bg-bg rounded-xl border border-border p-3 flex flex-col items-center">
              <svg viewBox="0 0 260 160" className="w-full h-44 overflow-visible">
                {/* Grid guidelines */}
                <line x1="20" y1="140" x2="240" y2="140" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="20" y1="20" x2="20" y2="140" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />

                {/* Hyperbolic Curve x * y = k */}
                <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

                {/* Operating Point */}
                <circle cx={currentPointSvg.x} cy={currentPointSvg.y} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />

                {/* Coordinate text */}
                <text x="25" y="20" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">
                  Reserve Y ({activePair.tokenY})
                </text>
                <text x="175" y="152" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">
                  Reserve X ({activePair.tokenX})
                </text>
              </svg>

              <div className="w-full flex justify-between items-center pt-2 text-[11px] text-ink-soft border-t border-border mt-1">
                <span>Current Reserves:</span>
                <span className="font-mono font-bold text-ink">
                  {reserveX.toLocaleString()} {activePair.tokenX} • {reserveY.toLocaleString()} {activePair.tokenY}
                </span>
              </div>
            </div>

            {/* Live TVL & Share Metrics */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-bg border border-border">
                <span className="text-[10px] text-ink-soft uppercase font-bold block">Pool TVL</span>
                <span className="font-mono font-bold text-xs text-accent">
                  ${Math.round(currentTVL).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-bg border border-border">
                <span className="text-[10px] text-ink-soft uppercase font-bold block">Your LP Share</span>
                <span className="font-mono font-bold text-xs text-accent">
                  {userLpSharePct.toFixed(1)}% of Pool
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-bg border border-border">
                <span className="text-[10px] text-ink-soft uppercase font-bold block">Estimated Fee APY</span>
                <span className="font-mono font-bold text-xs text-emerald-600">
                  {feeApyPct.toFixed(1)}% APY
                </span>
              </div>
            </div>
          </Card>

          {/* Market Simulation Buttons Card */}
          <Card data-tour="sim-buttons" className="p-5 space-y-4 bg-white border-2 border-ink rounded-xl shadow-pop-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-heading font-bold text-sm text-ink flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Simulate Market Trading Flow
                </h4>
                <p className="text-[11px] text-ink-soft">
                  Simulate retail traders and arbitrage bots trading against this pool.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {totalSimulatedTrades} Total Trades
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSimulateMarketVolume(1)}
                className="text-xs flex flex-col items-center py-2.5 h-auto gap-0.5"
              >
                <span className="font-bold">+1 Swap</span>
                <span className="text-[10px] text-ink-soft">Retail Trader</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSimulateMarketVolume(10)}
                className="text-xs flex flex-col items-center py-2.5 h-auto gap-0.5 border-accent/30 text-accent"
              >
                <span className="font-bold">+10 Swaps</span>
                <span className="text-[10px] opacity-80">Active Market</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSimulateMarketVolume(100)}
                className="text-xs flex flex-col items-center py-2.5 h-auto gap-0.5 shadow-xs"
              >
                <span className="font-bold">+100 Swaps</span>
                <span className="text-[10px] opacity-90">High Vol / Arbitrage</span>
              </Button>
            </div>

            {simulationSummary && (
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-[11px] text-ink leading-relaxed animate-in fade-in duration-200">
                <strong>Market Activity Update:</strong> {simulationSummary}
              </div>
            )}

            {/* REAL-WORLD NOTE: WHY THERE ARE NO BUTTONS IN REAL LIFE */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>DeFi Reality Check: How Pools Work in Real Life</span>
              </div>
              <p className="leading-relaxed">
                In real DeFi (like Raydium, Orca, or Meteora), there are no simulation buttons! Real liquidity pools are traded 24/7 by automated market makers, arbitrage bots written in Python and Rust, and DEX routing aggregators like Jupiter. We built these simulation buttons so you can witness hours of decentralized trading flow and fee accrual in seconds.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Swap Action & LP Fee Claiming (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Manual Swap Box */}
          <Card className="p-5 space-y-4 bg-white border-2 border-ink rounded-xl shadow-pop-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-heading font-bold text-sm text-ink">
                Test Manual Swap
              </h4>
              <button
                type="button"
                onClick={() => setSwapDirection((prev) => (prev === 'y-to-x' ? 'x-to-y' : 'y-to-x'))}
                className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Flip Direction
              </button>
            </div>

            <div className="space-y-3">
              <Slider
                label={`You Pay (${swapDirection === 'y-to-x' ? activePair.tokenY : activePair.tokenX})`}
                value={tradeAmount}
                min={1}
                max={swapDirection === 'y-to-x' ? Math.round(reserveY * 0.15) : Math.round(reserveX * 0.15)}
                step={1}
                unit={swapDirection === 'y-to-x' ? activePair.tokenY : activePair.tokenX}
                onChange={setTradeAmount}
              />

              <div className="p-3.5 rounded-xl bg-bg border border-border space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-ink-soft">
                  <span>Estimated Output:</span>
                  <span className="font-mono font-bold text-accent">
                    {swapResult.amountOut.toFixed(4)} {swapDirection === 'y-to-x' ? activePair.tokenX : activePair.tokenY}
                  </span>
                </div>
                <div className="flex justify-between items-center text-ink-soft">
                  <span>Price Impact:</span>
                  <span
                    className={`font-mono font-bold ${
                      swapResult.priceImpact > 0.05
                        ? 'text-red-600'
                        : swapResult.priceImpact > 0.01
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {(swapResult.priceImpact * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-ink-soft">
                  <span>Trading Fee (0.3%):</span>
                  <span className="font-mono font-bold text-ink">
                    {swapResult.feeAmount.toFixed(4)} {swapDirection === 'y-to-x' ? activePair.tokenY : activePair.tokenX}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleExecuteManualSwap}
                className="w-full gap-2 text-xs py-2.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Execute Swap in Pool
              </Button>
            </div>
          </Card>

          {/* ACCRUED FEES & ON-CHAIN CLAIMING CARD */}
          <Card data-tour="fee-claim-card" className="p-5 space-y-4 bg-white border-2 border-ink rounded-xl shadow-pop-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-heading font-bold text-sm text-ink flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Your Accrued LP Fees
                </h4>
                <p className="text-[11px] text-ink-soft">
                  Earned from 0.3% protocol fee on all trades.
                </p>
              </div>
              <Badge variant="accent" className="text-[10px]">
                {userLpSharePct.toFixed(1)}% LP Share
              </Badge>
            </div>

            {/* Unclaimed Balances */}
            <div className="p-4 rounded-xl bg-accent/10 border border-accent space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-950 font-semibold">Unclaimed Fees:</span>
                <span className="font-mono font-semibold text-emerald-900 text-sm">
                  ${totalUnclaimedUsd.toFixed(2)} USD
                </span>
              </div>

              <div className="pt-2 border-t border-accent/20 flex justify-between items-center text-[11px] font-mono text-emerald-900">
                <span>{unclaimedFeesX.toFixed(4)} {activePair.tokenX}</span>
                <span>+</span>
                <span>{unclaimedFeesY.toFixed(2)} {activePair.tokenY}</span>
              </div>
            </div>

            <Button
              variant="accent"
              onClick={handleClaimFees}
              disabled={isClaiming || (unclaimedFeesX <= 0 && unclaimedFeesY <= 0)}
              isLoading={isClaiming}
              className="w-full gap-2 text-xs py-2.5 shadow-sm"
            >
              <Coins className="w-3.5 h-3.5" />
              {unclaimedFeesX > 0 || unclaimedFeesY > 0
                ? `Claim Accrued Fees ($${totalUnclaimedUsd.toFixed(2)})`
                : 'No Unclaimed Fees Yet'}
            </Button>

            {claimedHistory && (
              <div className="p-3 rounded-xl bg-bg border border-border space-y-1.5 text-[11px] animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulated claim recorded: ${claimedHistory.totalUsd.toFixed(2)} in accrued fees</span>
                </div>
                <div className="font-mono text-[10px] text-ink-soft truncate">
                  Tx Receipt: Simulated claim #{claimedHistory.txSig.slice(-6)} — no real wallet or transaction involved
                </div>
              </div>
            )}

            <div className="text-[10px] text-ink-soft leading-relaxed border-t border-border pt-2">
               <strong>How Claiming Works:</strong> On Solana AMMs (like Raydium CPMM or Orca Whirlpools), trading fees accumulate in escrow token accounts until you submit a claim instruction. In this lab the claim is simulated, so nothing is sent to a real wallet.
            </div>
          </Card>
        </div>
      </div>

      {/* What Just Happened? */}
      {(totalSimulatedTrades > 0 || claimedHistory) && (
        <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
            <p className="text-ink-soft leading-relaxed">
              {claimedHistory
                ? `You claimed $${claimedHistory.totalUsd.toFixed(2)} of accrued swap fees into your wallet. Your ${userLpSharePct.toFixed(1)}% LP share stays in the pool and starts earning again on the very next trade.`
                : `${totalSimulatedTrades === 1 ? '1 trade ran' : `${totalSimulatedTrades} simulated trades ran`} through the ${activePair.name} pool. Every swap paid 0.3% in trading fees to liquidity providers, and your ${userLpSharePct.toFixed(1)}% LP share accumulated $${totalUnclaimedUsd.toFixed(2)} USD in unclaimed fees. Trade volume × fee rate × your LP share = your yield.`}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
