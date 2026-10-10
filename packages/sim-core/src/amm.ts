import { SwapResult } from './types.js';

/**
 * Returns the spot price of Token A quoted in Token B.
 * p0 = reserveB / reserveA
 */
export function getSpotPrice(reserveA: number, reserveB: number): number {
  if (reserveA <= 0 || reserveB <= 0) {
    throw new Error('Reserves must be greater than zero');
  }
  return reserveB / reserveA;
}

/**
 * Calculates swap output for A -> B in a constant-product pool (x * y = k).
 * dx_eff = amountIn * (1 - feeRate)
 * out = reserveOut * dx_eff / (reserveIn + dx_eff)
 */
export function getSwapOutput(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feeRate: number = 0.003
): number {
  if (amountIn <= 0) return 0;
  if (reserveIn <= 0 || reserveOut <= 0) {
    throw new Error('Reserves must be positive');
  }
  if (feeRate < 0 || feeRate >= 1) {
    throw new Error('Fee rate must be between 0 and 1');
  }

  const effectiveIn = amountIn * (1 - feeRate);
  return (reserveOut * effectiveIn) / (reserveIn + effectiveIn);
}

/**
 * Calculates price impact (excluding fee) according to Appendix A:
 * impact = 1 - (out_nofee / dx) / p0
 * where out_nofee = reserveOut * dx / (reserveIn + dx) and p0 = reserveOut / reserveIn.
 * Mathematically identical to dx / (reserveIn + dx).
 */
export function getPriceImpact(amountIn: number, reserveIn: number): number {
  if (amountIn <= 0 || reserveIn <= 0) return 0;
  return amountIn / (reserveIn + amountIn);
}

/**
 * Alternative form of price impact calculation from formula:
 * 1 - (out_nofee / dx) / p0
 */
export function getPriceImpactFromFormula(
  amountIn: number,
  reserveIn: number,
  reserveOut: number
): number {
  if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0;
  const p0 = getSpotPrice(reserveIn, reserveOut);
  const outNoFee = (reserveOut * amountIn) / (reserveIn + amountIn);
  const execPriceNoFee = outNoFee / amountIn;
  return 1 - execPriceNoFee / p0;
}

/**
 * Simulates a full swap trade and returns comprehensive trade metrics.
 */
export function simulateSwap(
  amountIn: number,
  reserveA: number,
  reserveB: number,
  aToB: boolean = true,
  feeRate: number = 0.003
): SwapResult {
  const reserveIn = aToB ? reserveA : reserveB;
  const reserveOut = aToB ? reserveB : reserveA;

  const amountOut = getSwapOutput(amountIn, reserveIn, reserveOut, feeRate);
  const feeAmount = amountIn * feeRate;
  const priceImpact = getPriceImpact(amountIn, reserveIn);
  const executionPrice = amountIn > 0 ? amountOut / amountIn : 0;

  const newReserveIn = reserveIn + amountIn;
  const newReserveOut = reserveOut - amountOut;

  return {
    amountIn,
    amountOut,
    executionPrice,
    priceImpact,
    feeAmount,
    newReserveA: aToB ? newReserveIn : newReserveOut,
    newReserveB: aToB ? newReserveOut : newReserveIn,
  };
}

/**
 * Calculates initial LP tokens minted for first deposit: sqrt(a * b) - locked
 */
export function calculateInitialLP(
  amountA: number,
  amountB: number,
  minLocked: number = 0
): number {
  if (amountA <= 0 || amountB <= 0) return 0;
  const lp = Math.sqrt(amountA * amountB);
  return Math.max(0, lp - minLocked);
}

/**
 * Calculates subsequent LP tokens minted: min(a / reserveA, b / reserveB) * totalLPSupply
 */
export function calculateSubsequentLP(
  amountA: number,
  amountB: number,
  reserveA: number,
  reserveB: number,
  totalLPSupply: number
): number {
  if (amountA <= 0 || amountB <= 0 || reserveA <= 0 || reserveB <= 0 || totalLPSupply <= 0) {
    return 0;
  }
  const shareA = amountA / reserveA;
  const shareB = amountB / reserveB;
  return Math.min(shareA, shareB) * totalLPSupply;
}

/**
 * Returns user's pool share ratio: userLP / totalLPSupply
 */
export function getPoolShare(userLP: number, totalLPSupply: number): number {
  if (userLP <= 0 || totalLPSupply <= 0) return 0;
  return Math.min(1, userLP / totalLPSupply);
}
