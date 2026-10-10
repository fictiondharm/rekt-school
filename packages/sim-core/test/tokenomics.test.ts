import { describe, it, expect } from 'vitest';
import {
  calculateSupplyAtMonth,
  evaluateTokenomicsHealth,
  simulateCliffSellPressure,
  evaluateTokenLaunch,
  TokenomicsConfig,
} from '../src/tokenomics';

describe('Tokenomics & Vesting Core', () => {
  const healthyConfig: TokenomicsConfig = {
    totalSupply: 1_000_000_000,
    initialPriceUSD: 0.10,
    allocations: [
      {
        name: 'Community & Ecosystem',
        percentage: 50,
        cliffMonths: 0,
        vestingMonths: 48,
        initialUnlockPct: 20,
        isInsider: false,
      },
      {
        name: 'Core Contributors',
        percentage: 20,
        cliffMonths: 12,
        vestingMonths: 36,
        initialUnlockPct: 0,
        isInsider: true,
      },
      {
        name: 'Investors (Seed & Series A)',
        percentage: 15,
        cliffMonths: 12,
        vestingMonths: 24,
        initialUnlockPct: 0,
        isInsider: true,
      },
      {
        name: 'Public Airdrop & Liquidity',
        percentage: 15,
        cliffMonths: 0,
        vestingMonths: 0,
        initialUnlockPct: 100,
        isInsider: false,
      },
    ],
  };

  it('calculates initial circulating float at month 0', () => {
    const month0 = calculateSupplyAtMonth(healthyConfig, 0);
    // 50% * 20% = 10% + 15% * 100% = 15% -> 25% initial float
    expect(month0.circulatingPct).toBeCloseTo(25, 1);
    expect(month0.circulatingSupply).toBe(250_000_000);
    expect(month0.marketCapUSD).toBe(25_000_000);
  });

  it('respects cliff locks for insiders', () => {
    const month6 = calculateSupplyAtMonth(healthyConfig, 6);
    expect(month6.unlockedByGroup['Core Contributors']).toBe(0);
    expect(month6.unlockedByGroup['Investors (Seed & Series A)']).toBe(0);

    const month18 = calculateSupplyAtMonth(healthyConfig, 18);
    // Contributors vest linearly after 12 months cliff
    expect(month18.unlockedByGroup['Core Contributors']).toBeGreaterThan(0);
  });

  it('evaluates healthy vs predatory tokenomics', () => {
    const health = evaluateTokenomicsHealth(healthyConfig);
    expect(health.isHealthy).toBe(true);
    expect(health.score).toBeGreaterThanOrEqual(70);
    expect(health.redFlags).toHaveLength(0);

    // Predatory low float / insider heavy token
    const predatoryConfig: TokenomicsConfig = {
      totalSupply: 10_000_000_000,
      initialPriceUSD: 1.0,
      allocations: [
        {
          name: 'Team & Foundation',
          percentage: 45,
          cliffMonths: 6,
          vestingMonths: 12,
          initialUnlockPct: 0,
          isInsider: true,
        },
        {
          name: 'Private Seed VCs',
          percentage: 30,
          cliffMonths: 6,
          vestingMonths: 12,
          initialUnlockPct: 0,
          isInsider: true,
        },
        {
          name: 'Community Float',
          percentage: 25,
          cliffMonths: 0,
          vestingMonths: 24,
          initialUnlockPct: 10, // only 2.5% initial float!
          isInsider: false,
        },
      ],
    };

    const badHealth = evaluateTokenomicsHealth(predatoryConfig);
    expect(badHealth.isHealthy).toBe(false);
    expect(badHealth.score).toBeLessThan(50);
    expect(badHealth.redFlags.length).toBeGreaterThanOrEqual(2);
  });

  it('simulates AMM sell pressure during token unlock cliff', () => {
    // 50,000,000 tokens unlocked, 40% sold (20,000,000 dumped)
    // Pool has 100,000,000 tokens and 10,000,000 USDC ($0.10 price)
    const result = simulateCliffSellPressure({
      unlockedTokensAmount: 50_000_000,
      sellerParticipationPct: 40,
      poolTokenReserves: 100_000_000,
      poolUSDReserves: 10_000_000,
    });

    expect(result.tokensDumped).toBe(20_000_000);
    expect(result.initialPrice).toBe(0.10);
    expect(result.postDumpPrice).toBeLessThan(result.initialPrice);
    expect(result.priceDrawdownPct).toBeGreaterThan(15);
    expect(result.usdExtracted).toBeGreaterThan(0);
  });

  it('correctly evaluates Fair, Wait, and Trap token launches', () => {
    // 1. Fair launch: 25% float, 1.2x peer comps, 12m cliff, 25% insider
    const fairLaunch = evaluateTokenLaunch({
      projectName: 'SolFlow Router',
      ticker: 'FLOW',
      fdvUSD: 50_000_000,
      initialFloatPct: 25,
      cliffMonths: 12,
      insiderSharePct: 25,
      annualRevenueUSD: 2_000_000,
      peerMedianFDVUSD: 45_000_000,
    });
    expect(fairLaunch.verdict).toBe('fair');
    expect(fairLaunch.score).toBeGreaterThanOrEqual(70);
    expect(fairLaunch.riskFactors.length).toBe(0);

    // 2. Predatory trap launch: 3% float, 12x peer comps, 3m cliff, 65% insider
    const trapLaunch = evaluateTokenLaunch({
      projectName: 'Nexus Protocol',
      ticker: 'NEX',
      fdvUSD: 1_200_000_000,
      initialFloatPct: 3,
      cliffMonths: 3,
      insiderSharePct: 65,
      annualRevenueUSD: 100_000,
      peerMedianFDVUSD: 100_000_000,
    });
    expect(trapLaunch.verdict).toBe('trap');
    expect(trapLaunch.score).toBeLessThan(45);
    expect(trapLaunch.riskFactors.length).toBeGreaterThanOrEqual(3);

    // 3. Overvalued / Wait launch: 10% float, 3.5x peer comps, 12m cliff, 40% insider
    const waitLaunch = evaluateTokenLaunch({
      projectName: 'HyperYield',
      ticker: 'HYP',
      fdvUSD: 350_000_000,
      initialFloatPct: 10,
      cliffMonths: 12,
      insiderSharePct: 40,
      annualRevenueUSD: 1_000_000,
      peerMedianFDVUSD: 100_000_000,
    });
    expect(waitLaunch.verdict).toBe('wait');
    expect(waitLaunch.score).toBeGreaterThanOrEqual(45);
    expect(waitLaunch.score).toBeLessThan(70);
  });
});
