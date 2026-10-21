import { simulateSwap } from '@defi-mommy/sim-core';

/**
 * Shared Liquidity Lab model.
 *
 * Both the homepage teaser and the I1 lesson simulator use these pools, the
 * same constant-product math (via @defi-mommy/sim-core) and the same verdict
 * thresholds, so the two can never disagree.
 */

export type PoolType = 'shallow' | 'deep';

export interface PoolReserves {
  /** SOL side of the pool. */
  sol: number;
  /** fUSDC side of the pool. */
  usdc: number;
}

export const LIQUIDITY_POOLS: Record<PoolType, PoolReserves> = {
  shallow: { sol: 10, usdc: 2000 },
  deep: { sol: 1000, usdc: 200000 },
};

export const POOL_META: Record<PoolType, { name: string; depth: string; reserves: string }> = {
  shallow: {
    name: 'Shallow pool',
    depth: 'Low liquidity',
    reserves: '10 SOL / 2,000 fUSDC',
  },
  deep: {
    name: 'Deep pool',
    depth: 'High liquidity',
    reserves: '1,000 SOL / 200,000 fUSDC',
  },
};

/** Trading fee charged by the pool (0.3%). */
export const SWAP_FEE_RATE = 0.003;

export const TRADE_SIZE = {
  min: 10,
  max: 500,
  step: 5,
  default: 50,
} as const;

export type Verdict = 'SAFE' | 'OUCH' | 'REKT';

/** Price impact (in %) below which a trade is safe / ouch. */
export const IMPACT_THRESHOLDS = {
  safe: 1,
  ouch: 5,
} as const;

export const MAXI_LINES: Record<Verdict, string> = {
  SAFE: 'Deep pool, tiny dent. This is what liquidity buys you.',
  OUCH: 'Feel that? Thin pools charge you for being big.',
  REKT: 'And that’s how you get rekt. Now try the deep pool.',
};

/** Maxi says this while the lab is still auto-playing. */
export const MAXI_AUTO_LINE = 'Watch the shallow pool. Then grab the slider.';

export const VERDICT_CLASSES: Record<Verdict, { badge: string; bar: string }> = {
  SAFE: { badge: 'bg-quaternary text-ink', bar: 'bg-quaternary' },
  OUCH: { badge: 'bg-tertiary text-ink', bar: 'bg-tertiary' },
  REKT: { badge: 'bg-secondary text-ink', bar: 'bg-secondary' },
};

export interface PoolTrade {
  /** SOL received for the trade. */
  amountOut: number;
  /** fUSDC paid as a trading fee. */
  feeAmount: number;
  /** Price impact in percent. */
  impactPct: number;
  /** Spot price of SOL in fUSDC. */
  spotPrice: number;
}

/**
 * Simulates a fUSDC -> SOL swap against one of the two pools.
 * Swapping fUSDC in means the fUSDC reserve is the reserve in.
 */
export function simulatePoolTrade(poolType: PoolType, amountIn: number): PoolTrade {
  const { sol, usdc } = LIQUIDITY_POOLS[poolType];
  const swap = simulateSwap(amountIn, sol, usdc, false, SWAP_FEE_RATE);
  return {
    amountOut: swap.amountOut,
    feeAmount: swap.feeAmount,
    impactPct: swap.priceImpact * 100,
    spotPrice: usdc / sol,
  };
}

/** SAFE below 1% impact, OUCH below 5%, REKT from 5% up. */
export function verdictForImpact(impactPct: number): Verdict {
  if (impactPct < IMPACT_THRESHOLDS.safe) return 'SAFE';
  if (impactPct < IMPACT_THRESHOLDS.ouch) return 'OUCH';
  return 'REKT';
}

/** Normalised bar width (2% - 100%) for the side-by-side comparison. */
export function impactBarWidth(impactPct: number): number {
  return Math.max(2, Math.min(100, (impactPct / 20) * 100));
}
