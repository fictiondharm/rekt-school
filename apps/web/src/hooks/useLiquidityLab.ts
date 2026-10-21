'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LIQUIDITY_POOLS,
  MAXI_AUTO_LINE,
  MAXI_LINES,
  TRADE_SIZE,
  impactBarWidth,
  simulatePoolTrade,
  verdictForImpact,
  type PoolType,
  type Verdict,
} from '@/lib/liquidityLab';

export interface UseLiquidityLabOptions {
  /** Run a demo on the slider until the visitor takes over. */
  autoPlay?: boolean;
  /**
   * 'sweep'  - linear sweep across the whole range (homepage teaser).
   * 'demo'   - sine wave that also flips between the two pools (I1 lesson).
   */
  strategy?: 'sweep' | 'demo';
  initialPool?: PoolType;
  initialTradeAmount?: number;
  /** Fired when the visitor picks the deep pool themselves. */
  onGoalAchieved?: () => void;
}

export interface UseLiquidityLabResult {
  poolType: PoolType;
  tradeAmount: number;
  /** True once the visitor has touched a control. */
  hasInteracted: boolean;
  /** True while the auto-play is still driving the slider. */
  isAuto: boolean;
  spotPrice: number;
  amountOut: number;
  feeAmount: number;
  impactPct: number;
  verdict: Verdict;
  /** What Maxi is saying right now. */
  maxiLine: string;
  shallowTrade: ReturnType<typeof simulatePoolTrade>;
  deepTrade: ReturnType<typeof simulatePoolTrade>;
  shallowBarWidth: number;
  deepBarWidth: number;
  /** Attach to the element that should trigger the auto-play when visible. */
  rootRef: React.RefObject<HTMLDivElement | null>;
  setPoolType: (pool: PoolType) => void;
  setTradeAmount: (amount: number) => void;
  /** Stop the auto-play without changing anything else (pointer down on a control). */
  stopAuto: () => void;
  reset: () => void;
}

export function useLiquidityLab({
  autoPlay = false,
  strategy = 'sweep',
  initialPool = 'shallow',
  initialTradeAmount = TRADE_SIZE.default,
  onGoalAchieved,
}: UseLiquidityLabOptions = {}): UseLiquidityLabResult {
  const [poolType, setPoolTypeState] = useState<PoolType>(initialPool);
  const [tradeAmount, setTradeAmountState] = useState<number>(initialTradeAmount);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [takenOver, setTakenOver] = useState(false);
  const [inView, setInView] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const userTookOver = useRef(false);
  const sweepDirection = useRef<1 | -1>(1);

  // Only auto-play while the lab is on screen.
  useEffect(() => {
    if (!autoPlay || typeof IntersectionObserver === 'undefined') return;
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoPlay]);

  useEffect(() => {
    if (!autoPlay || !inView || userTookOver.current) return;

    setHasInteracted(true);
    let step = 0;

    const id = setInterval(
      () => {
        if (userTookOver.current) {
          clearInterval(id);
          return;
        }

        if (strategy === 'demo') {
          step += 1;
          const wave = (Math.sin(step / 8) + 1) / 2; // 0..1
          setTradeAmountState(Math.max(10, Math.round((10 + wave * 490) / 10) * 10));
          if (step % 28 === 0) {
            setPoolTypeState((current) => (current === 'shallow' ? 'deep' : 'shallow'));
          }
          return;
        }

        setTradeAmountState((current) => {
          const next = current + TRADE_SIZE.step * sweepDirection.current;
          if (next >= TRADE_SIZE.max) {
            sweepDirection.current = -1;
            return TRADE_SIZE.max;
          }
          if (next <= TRADE_SIZE.min) {
            sweepDirection.current = 1;
            return TRADE_SIZE.min;
          }
          return next;
        });
      },
      strategy === 'demo' ? 110 : 70
    );

    return () => clearInterval(id);
  }, [autoPlay, inView, strategy]);

  const takeOver = useCallback(() => {
    userTookOver.current = true;
    setTakenOver(true);
    setHasInteracted(true);
  }, []);

  const setPoolType = useCallback(
    (pool: PoolType) => {
      takeOver();
      setPoolTypeState(pool);
      if (pool === 'deep' && onGoalAchieved) onGoalAchieved();
    },
    [onGoalAchieved, takeOver]
  );

  const setTradeAmount = useCallback(
    (amount: number) => {
      takeOver();
      setTradeAmountState(amount);
    },
    [takeOver]
  );

  const stopAuto = useCallback(() => {
    takeOver();
  }, [takeOver]);

  const reset = useCallback(() => {
    takeOver();
    setPoolTypeState('shallow');
    setTradeAmountState(TRADE_SIZE.default);
    sweepDirection.current = 1;
  }, [takeOver]);

  const shallowTrade = useMemo(() => simulatePoolTrade('shallow', tradeAmount), [tradeAmount]);
  const deepTrade = useMemo(() => simulatePoolTrade('deep', tradeAmount), [tradeAmount]);
  const currentTrade = poolType === 'shallow' ? shallowTrade : deepTrade;

  const verdict = verdictForImpact(currentTrade.impactPct);
  const isAuto = autoPlay && !takenOver;

  return {
    poolType,
    tradeAmount,
    hasInteracted,
    isAuto,
    spotPrice: currentTrade.spotPrice,
    amountOut: currentTrade.amountOut,
    feeAmount: currentTrade.feeAmount,
    impactPct: currentTrade.impactPct,
    verdict,
    maxiLine: isAuto ? MAXI_AUTO_LINE : MAXI_LINES[verdict],
    shallowTrade,
    deepTrade,
    shallowBarWidth: impactBarWidth(shallowTrade.impactPct),
    deepBarWidth: impactBarWidth(deepTrade.impactPct),
    rootRef,
    setPoolType,
    setTradeAmount,
    stopAuto,
    reset,
  };
}

/** Exported for convenience so components can import the pool list from one place. */
export { LIQUIDITY_POOLS };
