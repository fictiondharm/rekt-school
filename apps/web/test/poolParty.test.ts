import { describe, it, expect } from 'vitest';
import {
  POOL_CONFIG,
  POOL_FIT,
  POOLS,
  SCENARIOS,
  adjustedRatios,
  auraFor,
  dayStartLP,
  feeForDay,
  getPool,
  hodlValueAt,
  ilPercent,
  lpValueAt,
  pickScenarioId,
  scoreFor,
  simulateRun,
  type PoolId,
  type ScenarioId,
  type Tranche,
} from '../src/lib/poolParty';
import { hashSeed } from '../src/lib/rugTycoon';

/**
 * Mirrors the component's day loop: credit each day's fee as the day opens,
 * optionally add $100 on the given (0-based) days after the day is shown,
 * then finish the run on day 5.
 */
function runStayAll(
  poolId: PoolId,
  scenarioId: ScenarioId,
  addDays: number[] = []
): ReturnType<typeof simulateRun> {
  const ratios = adjustedRatios(poolId, scenarioId);
  let tranches: Tranche[] = [{ value: POOL_CONFIG.startingDeposit, entryRatio: 1 }];
  let fees = 0;
  for (let d = 0; d < POOL_CONFIG.days; d++) {
    fees += feeForDay(dayStartLP(tranches, ratios, d), poolId, scenarioId, d);
    if (addDays.includes(d)) {
      tranches = [...tranches, { value: POOL_CONFIG.addAmount, entryRatio: ratios[d] }];
    }
  }
  return simulateRun(poolId, scenarioId, tranches, fees, POOL_CONFIG.days - 1);
}

describe('impermanent loss formula', () => {
  it('is zero when the price ratio has not moved', () => {
    expect(ilPercent(1)).toBeCloseTo(0, 10);
  });

  it('matches known milestones for r = 2 and r = 0.5 (-5.72%)', () => {
    expect(ilPercent(2)).toBeCloseTo(-0.0572, 4);
    expect(ilPercent(0.5)).toBeCloseTo(-0.0572, 4);
  });

  it('matches known milestones for r = 4 and r = 0.25 (-20%)', () => {
    expect(ilPercent(4)).toBeCloseTo(-0.2, 10);
    expect(ilPercent(0.25)).toBeCloseTo(-0.2, 10);
  });

  it('is always <= 0 (AM-GM: (1+r)/2 >= sqrt(r))', () => {
    for (const r of [0.1, 0.25, 0.5, 0.9, 1, 1.1, 2, 4, 10]) {
      expect(ilPercent(r)).toBeLessThanOrEqual(1e-12);
    }
  });
});

describe('LP vs HODL valuation', () => {
  const single: Tranche[] = [{ value: 500, entryRatio: 1 }];

  it('LP value equals deposit when price has not moved, and matches HODL', () => {
    expect(lpValueAt(single, 1)).toBeCloseTo(500, 10);
    expect(hodlValueAt(single, 1)).toBeCloseTo(500, 10);
  });

  it('LP scales with sqrt(r): 4x price -> $1,000 LP', () => {
    expect(lpValueAt(single, 4)).toBeCloseTo(1000, 8);
  });

  it('HODL is the arithmetic mean: 4x price -> $1,250 held', () => {
    expect(hodlValueAt(single, 4)).toBeCloseTo(1250, 8);
  });

  it('IL dollars equal LP minus HODL and agree with ilPercent', () => {
    const lp = lpValueAt(single, 4);
    const hodl = hodlValueAt(single, 4);
    expect(lp - hodl).toBeCloseTo(hodl * ilPercent(4), 8);
  });

  it('every tranche prices independently from its own entry ratio', () => {
    const tranches: Tranche[] = [
      { value: 500, entryRatio: 1 },
      { value: 100, entryRatio: 4 },
    ];
    // At r=4: first tranche doubled via sqrt, second is flat (entered here).
    expect(lpValueAt(tranches, 4)).toBeCloseTo(1000 + 100, 8);
    // HODL: 500*(1+4)/2 + 100*(1+1)/2 = 1250 + 100.
    expect(hodlValueAt(tranches, 4)).toBeCloseTo(1350, 8);
  });
});

describe('fee math', () => {
  it('is proportional to position, per-pool fee dial and volume index', () => {
    // $500 position, blue-chip feePer1k=2.5, grind day 0 volumeIndex=0.8.
    expect(feeForDay(500, 'bluechip', 'grind', 0)).toBeCloseTo(500 / 1000 * 2.5 * 0.8, 10);
  });

  it('scales linearly with position size', () => {
    const a = feeForDay(500, 'memecoin', 'pump', 2);
    const b = feeForDay(1000, 'memecoin', 'pump', 2);
    expect(b).toBeCloseTo(a * 2, 10);
  });

  it('day 0 starts from the full deposit', () => {
    const ratios = adjustedRatios('bluechip', 'grind');
    const tranches: Tranche[] = [{ value: 500, entryRatio: 1 }];
    expect(dayStartLP(tranches, ratios, 0)).toBeCloseTo(500, 10);
    // Day 1 starts from the day-0 closing ratio.
    expect(dayStartLP(tranches, ratios, 1)).toBeCloseTo(lpValueAt(tranches, ratios[0]), 10);
  });
});

describe('pool volatility scaling', () => {
  it('applies volFactor around the 1.0 baseline', () => {
    // Memecoin volFactor 1.6 on the pump trough (base 0.55) -> 0.28.
    expect(adjustedRatios('memecoin', 'pump')[5]).toBeCloseTo(0.28, 10);
    // Stable volFactor 0.15 damps the same trough to 0.9325.
    expect(adjustedRatios('stable', 'pump')[5]).toBeCloseTo(0.9325, 10);
    // Every pool starts each scenario from ratio 1.
    for (const pool of POOLS) {
      for (const sc of SCENARIOS) {
        const r = adjustedRatios(pool.id, sc.id);
        expect(r).toHaveLength(POOL_CONFIG.days);
        expect(r.every((x) => x > 0)).toBe(true);
      }
    }
  });
});

describe('scenario outcomes (stay the whole run)', () => {
  it('memecoin + pump: impermanent loss eats the fees (net < 0)', () => {
    const res = runStayAll('memecoin', 'pump');
    expect(res.fees).toBeGreaterThan(0);
    expect(res.ilDollars).toBeLessThan(0);
    expect(res.net).toBeLessThan(0);
    expect(res.verdict.title).toBe('Impermanent loss ate your fees');
    expect(res.earlyWithdraw).toBe(false);
    expect(res.smartExit).toBe(false);
  });

  it('memecoin + chop: no trend, fees are nearly all profit', () => {
    const res = runStayAll('memecoin', 'chop');
    expect(res.net).toBeGreaterThan(10);
    expect(Math.abs(res.ilDollars)).toBeLessThan(5);
    expect(res.verdict.title).toBe('Fees stacked, IL slept');
  });

  it('stable + pump: tiny swings, small but positive net', () => {
    const res = runStayAll('stable', 'pump');
    expect(res.net).toBeGreaterThan(0);
    expect(res.net).toBeLessThan(20);
  });

  it('adds deepen both fees and IL, but chop still profits', () => {
    const noAdds = runStayAll('memecoin', 'chop');
    const withAdds = runStayAll('memecoin', 'chop', [0, 1, 2]);
    expect(withAdds.fees).toBeGreaterThan(noAdds.fees);
    expect(withAdds.net).toBeGreaterThan(0);
  });
});

describe('smart exit', () => {
  it('exiting the memecoin pump at the peak beats riding it to the bottom', () => {
    const poolId: PoolId = 'memecoin';
    const scenarioId: ScenarioId = 'pump';
    const ratios = adjustedRatios(poolId, scenarioId);
    const tranches: Tranche[] = [{ value: POOL_CONFIG.startingDeposit, entryRatio: 1 }];
    let fees = 0;
    const peakDay = 2; // highest adjusted ratio, 2.2
    for (let d = 0; d <= peakDay; d++) {
      fees += feeForDay(dayStartLP(tranches, ratios, d), poolId, scenarioId, d);
    }
    const res = simulateRun(poolId, scenarioId, tranches, fees, peakDay);
    expect(res.earlyWithdraw).toBe(true);
    expect(res.smartExit).toBe(true);
    expect(res.counterfactual).not.toBeNull();
    // Leaving with cash in hand beats the ride-down wealth.
    expect(res.lpValue + res.fees).toBeGreaterThan(res.counterfactual!.wealth);
    // Score picks up the smart-exit bonus on top of the (negative) net.
    const withoutBonus = scoreFor(res.net, poolId, scenarioId, false);
    expect(res.score).toBe(withoutBonus + POOL_CONFIG.smartWithdrawBonus);
  });

  it('exiting a chop run on day 0 is not smart (later fees beat the tiny LP bump)', () => {
    const poolId: PoolId = 'bluechip';
    const scenarioId: ScenarioId = 'chop';
    const ratios = adjustedRatios(poolId, scenarioId);
    const tranches: Tranche[] = [{ value: POOL_CONFIG.startingDeposit, entryRatio: 1 }];
    const fees = feeForDay(dayStartLP(tranches, ratios, 0), poolId, scenarioId, 0);
    const res = simulateRun(poolId, scenarioId, tranches, fees, 0);
    expect(res.earlyWithdraw).toBe(true);
    // Regression: a stale comparison once used the counterfactual fee TOTAL on
    // the exit side, wrongly flagging this exit as smart. The exit side must
    // only count fees actually collected by leaving (feesSoFar).
    expect(res.lpValue + res.fees).toBeLessThan(res.counterfactual!.wealth);
    expect(res.smartExit).toBe(false);
  });
});

describe('scoring', () => {
  it('awards the pool-fit bonus only for the designated pool', () => {
    const base = 10;
    expect(scoreFor(base, POOL_FIT.chop, 'chop', false)).toBe(
      base * POOL_CONFIG.netScale + POOL_CONFIG.poolFitBonus
    );
    expect(scoreFor(base, 'stable', 'chop', false)).toBe(base * POOL_CONFIG.netScale);
  });

  it('can be negative - a bad LP week is a bad score', () => {
    expect(scoreFor(-50, 'memecoin', 'pump', false)).toBeLessThan(0);
  });

  it('aura floors at zero and scales by auraPerScore', () => {
    expect(auraFor(0)).toBe(0);
    expect(auraFor(-100)).toBe(0);
    expect(auraFor(POOL_CONFIG.auraPerScore)).toBe(1);
    expect(auraFor(POOL_CONFIG.auraPerScore * 2 + 10)).toBe(2);
  });
});

describe('determinism', () => {
  it('pickScenarioId returns the same scenario for the same seed', () => {
    const seed = hashSeed('pool-party-fixed-test');
    const a = pickScenarioId(seed);
    for (let i = 0; i < 20; i++) {
      expect(pickScenarioId(seed)).toBe(a);
    }
  });

  it('simulateRun is pure: identical inputs produce identical results', () => {
    const a = runStayAll('memecoin', 'pump');
    const b = runStayAll('memecoin', 'pump');
    expect(a).toEqual(b);
  });

  it('getPool and adjustedRatios never depend on call order', () => {
    expect(getPool('memecoin').feePer1k).toBe(6);
    expect(adjustedRatios('stable', 'grind')).toEqual(adjustedRatios('stable', 'grind'));
  });
});
