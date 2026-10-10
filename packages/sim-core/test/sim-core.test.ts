import { describe, it, expect } from 'vitest';
import {
  getSpotPrice,
  getSwapOutput,
  getPriceImpact,
  getPriceImpactFromFormula,
  simulateSwap,
  calculateInitialLP,
  calculateSubsequentLP,
  getPoolShare,
} from '../src/amm.js';
import { getTVL, getMarketCap, getFDV, getFloatPct } from '../src/market.js';
import { getFeeAPR, getRewardAPR, getAPY, simulateUserDilution } from '../src/yield.js';

describe('Constant Product AMM (x * y = k)', () => {
  it('calculates spot price correctly', () => {
    // 100 SOL (x) and 10,000 USDC (y) -> price of SOL in USDC is 100
    const price = getSpotPrice(100, 10_000);
    expect(price).toBe(100);
  });

  it('throws on non-positive reserves for spot price', () => {
    expect(() => getSpotPrice(0, 10_000)).toThrow();
    expect(() => getSpotPrice(100, -1)).toThrow();
  });

  it('calculates swap output with standard 0.3% fee', () => {
    // Pool: 1,000 Token A, 1,000 Token B
    // Trade: 10 Token A in
    // dx_eff = 10 * 0.997 = 9.97
    // out = 1000 * 9.97 / (1000 + 9.97) = 9970 / 1009.97 ~= 9.87158...
    const out = getSwapOutput(10, 1000, 1000, 0.003);
    const expected = (1000 * (10 * 0.997)) / (1000 + 10 * 0.997);
    expect(out).toBeCloseTo(expected, 8);
    expect(out).toBeCloseTo(9.871579, 5);
  });

  it('verifies both price impact formulas agree', () => {
    const testCases = [
      { amountIn: 1, reserveIn: 1000, reserveOut: 2000 },
      { amountIn: 10, reserveIn: 1000, reserveOut: 1000 },
      { amountIn: 100, reserveIn: 1000, reserveOut: 5000 },
      { amountIn: 500, reserveIn: 1000, reserveOut: 1000 },
    ];

    for (const { amountIn, reserveIn, reserveOut } of testCases) {
      const simplified = getPriceImpact(amountIn, reserveIn);
      const original = getPriceImpactFromFormula(amountIn, reserveIn, reserveOut);
      expect(simplified).toBeCloseTo(original, 10);
    }
  });

  it('handles edge cases in swap calculations', () => {
    expect(getSwapOutput(0, 1000, 1000)).toBe(0);
    expect(getPriceImpact(0, 1000)).toBe(0);

    // Large trade (more than reserve): price impact should be large but strictly < 1
    const impactLarge = getPriceImpact(10_000, 1000);
    expect(impactLarge).toBe(10_000 / 11_000);
    expect(impactLarge).toBeLessThan(1);
    expect(impactLarge).toBeGreaterThan(0.9);
  });

  it('simulates full swap with correct state update and invariant k growth', () => {
    const reserveA = 10_000;
    const reserveB = 50_000;
    const kInitial = reserveA * reserveB;

    const result = simulateSwap(500, reserveA, reserveB, true, 0.003);
    expect(result.amountIn).toBe(500);
    expect(result.feeAmount).toBe(1.5);
    expect(result.amountOut).toBeGreaterThan(0);
    expect(result.newReserveA).toBe(10_500);
    expect(result.newReserveB).toBe(reserveB - result.amountOut);

    // Because fee is retained in the pool, new k should be >= kInitial
    const kFinal = result.newReserveA * result.newReserveB;
    expect(kFinal).toBeGreaterThanOrEqual(kInitial);
  });

  it('calculates initial LP tokens via sqrt(a * b)', () => {
    const lp = calculateInitialLP(100, 400, 0);
    expect(lp).toBe(200); // sqrt(40000) = 200
  });

  it('calculates subsequent LP proportionally to the limiting asset', () => {
    const reserveA = 100;
    const reserveB = 400;
    const totalLPSupply = 200;

    // Proportional deposit: 50 A, 200 B -> 50% increase -> 100 new LP
    const lpEqual = calculateSubsequentLP(50, 200, reserveA, reserveB, totalLPSupply);
    expect(lpEqual).toBe(100);

    // Unbalanced deposit: 50 A, 100 B -> B is 25% increase, so limited to 50 LP
    const lpUnbalanced = calculateSubsequentLP(50, 100, reserveA, reserveB, totalLPSupply);
    expect(lpUnbalanced).toBe(50);
  });

  it('calculates pool share ratio', () => {
    expect(getPoolShare(50, 200)).toBe(0.25);
    expect(getPoolShare(200, 200)).toBe(1);
    expect(getPoolShare(0, 200)).toBe(0);
  });
});

describe('Market Cap, TVL, and FDV', () => {
  it('calculates TVL across multiple tokens', () => {
    const assets = [
      { amount: 100, price: 150 }, // $15,000
      { amount: 20_000, price: 1 }, // $20,000
    ];
    expect(getTVL(assets)).toBe(35_000);
  });

  it('calculates market cap and FDV correctly', () => {
    const price = 2.5;
    const circulating = 10_000_000;
    const total = 100_000_000;

    expect(getMarketCap(price, circulating)).toBe(25_000_000);
    expect(getFDV(price, total)).toBe(250_000_000);
    expect(getFloatPct(circulating, total)).toBe(0.1);
  });
});

describe('Yield, APR, APY and Dilution', () => {
  it('calculates fee APR and reward APR correctly', () => {
    // TVL = $1,000,000, 24h Volume = $100,000, Fee = 0.3%
    // Annual fee = 100,000 * 0.003 * 365 = $109,500
    // Fee APR = 109,500 / 1,000,000 = 10.95%
    const feeApr = getFeeAPR(100_000, 0.003, 1_000_000);
    expect(feeApr).toBeCloseTo(0.1095, 4);

    // 100 reward tokens/day * $5/token * 365 = $182,500
    // Reward APR = 182,500 / 1,000,000 = 18.25%
    const rewardApr = getRewardAPR(100, 5, 1_000_000);
    expect(rewardApr).toBeCloseTo(0.1825, 4);
  });

  it('calculates APY from APR with compounding', () => {
    // 10% APR compounded daily
    const apy = getAPY(0.10, 365);
    expect(apy).toBeGreaterThan(0.10);
    expect(apy).toBeCloseTo(0.105156, 4);
  });

  it('simulates dilution when users join', () => {
    // Initial TVL $100,000, APR 50%
    // 100 users deposit $1,000 each -> $100,000 added
    // TVL doubles to $200,000 -> APR halves to 25%
    const { newTVL, newAPR, dilutionPct } = simulateUserDilution(100_000, 0.50, 100, 1000);
    expect(newTVL).toBe(200_000);
    expect(newAPR).toBeCloseTo(0.25, 4);
    expect(dilutionPct).toBeCloseTo(0.50, 4);
  });
});
