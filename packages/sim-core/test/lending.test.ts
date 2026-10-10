import { describe, it, expect } from 'vitest';
import {
  getUtilizationRate,
  getBorrowAPR,
  getSupplyAPR,
  generateRateCurvePoints,
  getHealthFactor,
  getLiquidationPrice,
  simulateLiquidation,
  getImpermanentLoss,
  getNetLPReturn,
  DEFAULT_LENDING_CONFIG,
  LoanPosition,
} from '../src/lending.js';

describe('Lending & Money Market Math (Kinked Model)', () => {
  it('calculates utilization rate accurately', () => {
    expect(getUtilizationRate(100_000, 80_000)).toBe(0.80);
    expect(getUtilizationRate(100_000, 0)).toBe(0);
    expect(getUtilizationRate(100_000, 150_000)).toBe(1.0); // capped at 100%
  });

  it('calculates borrow APR below and above the kink', () => {
    // Config: Base 2%, optimal 80%, slope1 6%, slope2 70%
    // At U = 0%: Base = 2%
    expect(getBorrowAPR(0, DEFAULT_LENDING_CONFIG)).toBeCloseTo(0.02, 4);

    // At U = 40% (halfway to kink): 2% + (0.4/0.8)*6% = 2% + 3% = 5%
    expect(getBorrowAPR(0.40, DEFAULT_LENDING_CONFIG)).toBeCloseTo(0.05, 4);

    // At U = 80% (exactly kink): 2% + 6% = 8%
    expect(getBorrowAPR(0.80, DEFAULT_LENDING_CONFIG)).toBeCloseTo(0.08, 4);

    // At U = 90% (halfway past kink): 2% + 6% + (0.1/0.2)*70% = 8% + 35% = 43%
    expect(getBorrowAPR(0.90, DEFAULT_LENDING_CONFIG)).toBeCloseTo(0.43, 4);

    // At U = 100% (max): 2% + 6% + 70% = 78%
    expect(getBorrowAPR(1.0, DEFAULT_LENDING_CONFIG)).toBeCloseTo(0.78, 4);
  });

  it('calculates supply APR with reserve factor', () => {
    // At 80% utilization with 8% borrow APR and 15% reserve factor:
    // Supply APR = 0.80 * 0.08 * (1 - 0.15) = 0.064 * 0.85 = 5.44%
    const borrowAPR = getBorrowAPR(0.80, DEFAULT_LENDING_CONFIG);
    const supplyAPR = getSupplyAPR(0.80, borrowAPR, DEFAULT_LENDING_CONFIG.reserveFactor);
    expect(supplyAPR).toBeCloseTo(0.0544, 4);
  });

  it('generates smooth rate curve points', () => {
    const points = generateRateCurvePoints(DEFAULT_LENDING_CONFIG, 10);
    expect(points.length).toBe(11);
    expect(points[0].utilization).toBe(0);
    expect(points[10].utilization).toBe(1);
    expect(points[10].borrowAPR).toBeGreaterThan(points[0].borrowAPR);
  });
});

describe('Health Factor & Liquidation Engine', () => {
  const safePosition: LoanPosition = {
    collateralAmount: 10, // 10 SOL
    collateralPrice: 200, // $200/SOL -> $2,000 value
    borrowedDebt: 1000, // $1,000 USDC
    liquidationThreshold: 0.80, // 80%
    maxLTV: 0.75,
    liquidationBonus: 0.05, // 5% bonus
  };

  it('calculates health factor correctly', () => {
    // Collateral Value = 10 * 200 = 2000
    // HF = (2000 * 0.80) / 1000 = 1600 / 1000 = 1.6 (Safe)
    expect(getHealthFactor(safePosition)).toBeCloseTo(1.6, 3);
  });

  it('calculates exact liquidation price', () => {
    // P_liq = 1000 / (10 * 0.80) = 1000 / 8 = $125
    expect(getLiquidationPrice(safePosition)).toBeCloseTo(125, 2);

    // Verify: If price drops to $125, HF should be exactly 1.0
    const positionAt125 = { ...safePosition, collateralPrice: 125 };
    expect(getHealthFactor(positionAt125)).toBeCloseTo(1.0, 3);
  });

  it('correctly simulates liquidation when price crashes below threshold', () => {
    // SOL crashes to $100 -> Collateral Value = $1,000
    // HF = (1000 * 0.80) / 1000 = 0.80 < 1.0 -> Liquidatable!
    const underwaterPosition: LoanPosition = {
      ...safePosition,
      collateralPrice: 100,
    };

    const result = simulateLiquidation(underwaterPosition, 0.50);
    expect(result.isLiquidatable).toBe(true);
    expect(result.debtRepaid).toBe(500); // 50% of $1,000 debt repaid
    // Seized value = 500 * 1.05 = $525. At $100/SOL -> 5.25 SOL seized
    expect(result.collateralSeized).toBeCloseTo(5.25, 2);
    expect(result.liquidatorProfitUSD).toBeCloseTo(25, 2); // 5% of $500
    expect(result.remainingDebt).toBe(500);
    expect(result.remainingCollateral).toBeCloseTo(4.75, 2);
    // After 50% partial repayment, remaining position is at HF 0.76 (requires further liquidator action or collateral top-up)
    expect(result.newHealthFactor).toBeCloseTo(0.76, 2);
  });
});

describe('Impermanent Loss Math', () => {
  it('calculates known impermanent loss milestones', () => {
    // 1x (no price change) -> 0% loss
    expect(getImpermanentLoss(1.0)).toBeCloseTo(0, 5);

    // 1.25x price change -> ~-0.6% IL
    // 2 * sqrt(1.25) / (2.25) - 1 = 2 * 1.11803 / 2.25 - 1 = 0.9938 - 1 = -0.0062
    expect(getImpermanentLoss(1.25)).toBeCloseTo(-0.0062, 3);

    // 2x price change -> ~-5.72% IL
    expect(getImpermanentLoss(2.0)).toBeCloseTo(-0.0572, 3);

    // 5x price change -> ~-25.5% IL
    expect(getImpermanentLoss(5.0)).toBeCloseTo(-0.2546, 3);
  });

  it('calculates net LP return considering earned fees', () => {
    // At 2x price change (-5.72%), if fee returns are +10%, net should be positive +4.28%
    const net = getNetLPReturn(2.0, 0.10);
    expect(net).toBeCloseTo(0.0428, 3);
  });
});
