import { describe, it, expect } from 'vitest';
import {
  calculateStakingYield,
  calculateLSTExchangeRate,
  analyzeLSTDepeg,
} from '../src/staking';

describe('Staking & LST Math Core', () => {
  it('calculates net staking APR and compounding APY correctly', () => {
    // 7% gross inflation, 10% validator commission -> 6.3% net APR
    const res = calculateStakingYield(100, {
      inflationRate: 0.07,
      validatorCommission: 0.10,
      compoundingPeriodsPerYear: 182,
    });

    expect(res.nominalAPR).toBe(0.07);
    expect(res.netAPR).toBeCloseTo(0.063, 5);
    expect(res.netAPY).toBeGreaterThan(res.netAPR); // Compounding effect
    expect(res.netAPY).toBeCloseTo(0.065, 2);
    expect(res.rewardSOLPerYear).toBeCloseTo(6.5, 1);
  });

  it('handles 0% commission correctly', () => {
    const res = calculateStakingYield(100, {
      inflationRate: 0.08,
      validatorCommission: 0.0,
      compoundingPeriodsPerYear: 182,
    });

    expect(res.netAPR).toBe(0.08);
    expect(res.validatorFeePerYear).toBeCloseTo(0, 5);
  });

  it('throws on invalid inputs', () => {
    expect(() =>
      calculateStakingYield(-10, { inflationRate: 0.07, validatorCommission: 0.05 })
    ).toThrow();
    expect(() =>
      calculateStakingYield(100, { inflationRate: -0.01, validatorCommission: 0.05 })
    ).toThrow();
    expect(() =>
      calculateStakingYield(100, { inflationRate: 0.07, validatorCommission: 1.2 })
    ).toThrow();
  });

  it('calculates LST exchange rate appreciation over time', () => {
    const rateYear0 = calculateLSTExchangeRate(1.0, 0.07, 0);
    expect(rateYear0).toBe(1.0);

    const rateYear1 = calculateLSTExchangeRate(1.0, 0.07, 1);
    expect(rateYear1).toBeCloseTo(1.07, 4);

    const rateYear2 = calculateLSTExchangeRate(1.0, 0.07, 2);
    expect(rateYear2).toBeCloseTo(1.1449, 4);
  });

  it('analyzes LST depeg discount and arbitrage spread', () => {
    // True redemption value = 1.10 SOL, but secondary market AMM panic sells to 1.00 SOL
    const depeg = analyzeLSTDepeg(1.10, 1.00);

    expect(depeg.isDepegged).toBe(true);
    expect(depeg.depegDiscountPct).toBeCloseTo(9.09, 2); // (1.10 - 1.00) / 1.10 * 100
    expect(depeg.arbitrageProfitPct).toBeCloseTo(10.0, 2); // (1.10 - 1.00) / 1.00 * 100
  });

  it('detects healthy peg when discount is negligible', () => {
    const healthy = analyzeLSTDepeg(1.08, 1.078);
    expect(healthy.isDepegged).toBe(false);
    expect(healthy.depegDiscountPct).toBeLessThan(0.5);
  });
});
