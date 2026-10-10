/**
 * Tokenomics & Vesting Schedule Math Engine
 * Models supply expansion, insider allocations, unlock cliffs, and sell pressure impact.
 */

export interface AllocationGroup {
  name: string;
  percentage: number; // 0 to 100
  cliffMonths: number;
  vestingMonths: number;
  initialUnlockPct: number; // 0 to 100
  isInsider: boolean;
}

export interface TokenomicsConfig {
  totalSupply: number;
  initialPriceUSD: number;
  allocations: AllocationGroup[];
}

export interface SupplyAtMonth {
  month: number;
  circulatingSupply: number;
  circulatingPct: number;
  marketCapUSD: number;
  unlockedByGroup: Record<string, number>;
}

export interface TokenomicsHealthReport {
  score: number; // 0 to 100
  insiderAllocationPct: number;
  initialFloatPct: number;
  redFlags: string[];
  warnings: string[];
  isHealthy: boolean;
}

/**
 * Calculates circulating supply and unlock breakdown across all allocation buckets at month `t`
 */
export function calculateSupplyAtMonth(
  config: TokenomicsConfig,
  month: number
): SupplyAtMonth {
  if (month < 0) throw new Error('Month cannot be negative');

  let totalCirculating = 0;
  const unlockedByGroup: Record<string, number> = {};

  for (const group of config.allocations) {
    const totalGroupTokens = (group.percentage / 100) * config.totalSupply;
    let unlocked = 0;

    if (month === 0) {
      unlocked = (group.initialUnlockPct / 100) * totalGroupTokens;
    } else if (month < group.cliffMonths) {
      unlocked = (group.initialUnlockPct / 100) * totalGroupTokens;
    } else {
      const remainingTokens = totalGroupTokens * (1 - group.initialUnlockPct / 100);
      const vestingDuration = Math.max(1, group.vestingMonths - group.cliffMonths);
      const elapsedVesting = Math.min(vestingDuration, month - group.cliffMonths);
      const vestedFraction = elapsedVesting / vestingDuration;

      unlocked =
        (group.initialUnlockPct / 100) * totalGroupTokens +
        remainingTokens * vestedFraction;
    }

    unlockedByGroup[group.name] = unlocked;
    totalCirculating += unlocked;
  }

  const circulatingPct = (totalCirculating / config.totalSupply) * 100;
  const marketCapUSD = totalCirculating * config.initialPriceUSD;

  return {
    month,
    circulatingSupply: totalCirculating,
    circulatingPct,
    marketCapUSD,
    unlockedByGroup,
  };
}

/**
 * Evaluates tokenomics health score and identifies predatory red flags
 */
export function evaluateTokenomicsHealth(config: TokenomicsConfig): TokenomicsHealthReport {
  const redFlags: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. Check total allocation adds up to 100%
  const totalAlloc = config.allocations.reduce((sum, g) => sum + g.percentage, 0);
  if (Math.abs(totalAlloc - 100) > 0.01) {
    redFlags.push(`Allocations sum to ${totalAlloc.toFixed(1)}%, must equal 100%`);
    score -= 30;
  }

  // 2. Insider allocation (Team + Seed Investors + Advisors)
  const insiderPct = config.allocations
    .filter((g) => g.isInsider)
    .reduce((sum, g) => sum + g.percentage, 0);

  if (insiderPct > 45) {
    redFlags.push(`Predatory insider allocation (${insiderPct.toFixed(1)}% > 45%). Extreme central dump risk.`);
    score -= 35;
  } else if (insiderPct > 35) {
    warnings.push(`High insider allocation (${insiderPct.toFixed(1)}% > 35%). Watch team vesting carefully.`);
    score -= 15;
  }

  // 3. Initial circulating float (TGE Day 0)
  const month0 = calculateSupplyAtMonth(config, 0);
  const initialFloatPct = month0.circulatingPct;

  if (initialFloatPct < 8) {
    redFlags.push(`Low-float trap (${initialFloatPct.toFixed(1)}% < 8%). High FDV creates massive future unlock dilution.`);
    score -= 30;
  } else if (initialFloatPct < 15) {
    warnings.push(`Relatively low initial float (${initialFloatPct.toFixed(1)}%). Price may be artificially elevated.`);
    score -= 10;
  }

  // 4. Cliff sudden unlock shock
  const month6 = calculateSupplyAtMonth(config, 6);
  const month5 = calculateSupplyAtMonth(config, 5);
  const month6Jump = month6.circulatingPct - month5.circulatingPct;
  if (month6Jump > 15) {
    redFlags.push(`Severe unlock shock: +${month6Jump.toFixed(1)}% supply dumped onto market in a single month.`);
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    insiderAllocationPct: insiderPct,
    initialFloatPct,
    redFlags,
    warnings,
    isHealthy: redFlags.length === 0 && score >= 70,
  };
}

export interface CliffPressureParams {
  unlockedTokensAmount: number;
  sellerParticipationPct: number; // e.g. 50%
  poolTokenReserves: number;
  poolUSDReserves: number;
  feeRate?: number; // default 0.003
}

export interface CliffPressureResult {
  tokensDumped: number;
  initialPrice: number;
  postDumpPrice: number;
  priceDrawdownPct: number;
  usdExtracted: number;
}

/**
 * Simulates constant-product market impact when unlocked tokens are sold into an AMM pool
 */
export function simulateCliffSellPressure(params: CliffPressureParams): CliffPressureResult {
  const {
    unlockedTokensAmount,
    sellerParticipationPct,
    poolTokenReserves,
    poolUSDReserves,
    feeRate = 0.003,
  } = params;

  if (unlockedTokensAmount < 0 || poolTokenReserves <= 0 || poolUSDReserves <= 0) {
    throw new Error('Reserves and unlock amounts must be positive');
  }

  const tokensDumped = unlockedTokensAmount * (sellerParticipationPct / 100);
  const initialPrice = poolUSDReserves / poolTokenReserves;

  if (tokensDumped === 0) {
    return {
      tokensDumped: 0,
      initialPrice,
      postDumpPrice: initialPrice,
      priceDrawdownPct: 0,
      usdExtracted: 0,
    };
  }

  // Constant Product swap formula: dy = (y * dx * (1 - f)) / (x + dx * (1 - f))
  const dxEff = tokensDumped * (1 - feeRate);
  const usdExtracted = (poolUSDReserves * dxEff) / (poolTokenReserves + dxEff);

  const newPoolTokens = poolTokenReserves + tokensDumped;
  const newPoolUSD = poolUSDReserves - usdExtracted;
  const postDumpPrice = Math.max(0, newPoolUSD / newPoolTokens);

  const priceDrawdownPct = Math.max(0, ((initialPrice - postDumpPrice) / initialPrice) * 100);

  return {
    tokensDumped,
    initialPrice,
    postDumpPrice,
    priceDrawdownPct,
    usdExtracted,
  };
}

export interface LaunchParams {
  projectName: string;
  ticker: string;
  fdvUSD: number;
  initialFloatPct: number;
  cliffMonths: number;
  insiderSharePct: number;
  annualRevenueUSD: number;
  peerMedianFDVUSD: number;
}

export interface LaunchCheckItem {
  id: string;
  name: string;
  benchmark: string;
  actual: string;
  passed: boolean;
  impactScore: number;
  feedback: string;
}

export interface LaunchVerdict {
  score: number; // 0 to 100 (100 = pristine health, 0 = pure trap)
  verdict: 'fair' | 'wait' | 'trap';
  verdictLabel: string;
  fdvToPeerRatio: number;
  fdvToRevenueMultiple: number | null;
  riskFactors: string[];
  strengths: string[];
  checklist: LaunchCheckItem[];
}

/**
 * Evaluates a new token launch using fundamental float, valuation multiples, and lockup benchmarks
 */
export function evaluateTokenLaunch(params: LaunchParams): LaunchVerdict {
  let score = 100;
  const riskFactors: string[] = [];
  const strengths: string[] = [];
  const checklist: LaunchCheckItem[] = [];

  // 1. Initial Float Check
  const floatPassed = params.initialFloatPct >= 15;
  if (!floatPassed) {
    if (params.initialFloatPct < 5) {
      score -= 35;
      riskFactors.push(`Extreme predatory float: Only ${params.initialFloatPct}% circulating creates artificial scarcity pump.`);
    } else {
      score -= 20;
      riskFactors.push(`Low initial float: ${params.initialFloatPct}% leaves 80%+ supply locked for future dilution.`);
    }
  } else {
    strengths.push(`Healthy initial circulating float (${params.initialFloatPct}%).`);
  }
  checklist.push({
    id: 'float',
    name: 'Circulating Float Ratio',
    benchmark: '≥ 15% circulating on Day 1',
    actual: `${params.initialFloatPct}%`,
    passed: floatPassed,
    impactScore: floatPassed ? 0 : (params.initialFloatPct < 5 ? 35 : 20),
    feedback: floatPassed ? 'Good float prevents predatory supply manipulation.' : 'Low float enables easy market manipulation and huge later unlocks.',
  });

  // 2. Peer Valuation Multiple (Comps)
  const fdvToPeerRatio = params.peerMedianFDVUSD > 0 ? params.fdvUSD / params.peerMedianFDVUSD : 1;
  const peerPassed = fdvToPeerRatio <= 2.5;
  if (!peerPassed) {
    if (fdvToPeerRatio >= 5.0) {
      score -= 30;
      riskFactors.push(`Absurd valuation: FDV ($${(params.fdvUSD / 1e6).toFixed(0)}M) is ${(fdvToPeerRatio).toFixed(1)}x higher than established sector peers ($${(params.peerMedianFDVUSD / 1e6).toFixed(0)}M).`);
    } else {
      score -= 15;
      riskFactors.push(`Priced at premium: ${(fdvToPeerRatio).toFixed(1)}x sector median.`);
    }
  } else {
    strengths.push(`Competitive valuation relative to established sector peers (${(fdvToPeerRatio).toFixed(1)}x median).`);
  }
  checklist.push({
    id: 'valuation',
    name: 'Sector Peer Relative Valuation',
    benchmark: '≤ 2.5x of established peer median',
    actual: `${(fdvToPeerRatio).toFixed(1)}x ($${(params.fdvUSD / 1e6).toFixed(0)}M vs $${(params.peerMedianFDVUSD / 1e6).toFixed(0)}M)`,
    passed: peerPassed,
    impactScore: peerPassed ? 0 : (fdvToPeerRatio >= 5.0 ? 30 : 15),
    feedback: peerPassed ? 'Valuation is anchored to existing market benchmarks.' : 'Priced far above seasoned market leaders with proven traction.',
  });

  // 3. Vesting Cliff Duration
  const cliffPassed = params.cliffMonths >= 12;
  if (!cliffPassed) {
    if (params.cliffMonths < 6) {
      score -= 25;
      riskFactors.push(`Short cliff (${params.cliffMonths} mos): Insiders can dump before real product-market fit.`);
    } else {
      score -= 10;
      riskFactors.push(`Moderate cliff (${params.cliffMonths} mos): Shorter than institutional 12-month standard.`);
    }
  } else {
    strengths.push(`Long institutional lockup: ${params.cliffMonths} months investor cliff.`);
  }
  checklist.push({
    id: 'cliff',
    name: 'Investor Lockup Cliff',
    benchmark: '≥ 12 months minimum',
    actual: `${params.cliffMonths} months`,
    passed: cliffPassed,
    impactScore: cliffPassed ? 0 : (params.cliffMonths < 6 ? 25 : 10),
    feedback: cliffPassed ? 'Founders and VCs committed for at least one full year.' : 'Premature cliff enables early dumping.',
  });

  // 4. Insider Share Allocation
  const insiderPassed = params.insiderSharePct <= 35;
  if (!insiderPassed) {
    if (params.insiderSharePct >= 50) {
      score -= 20;
      riskFactors.push(`Oligarchic tokenomics: Insiders own ${params.insiderSharePct}% of total supply.`);
    } else {
      score -= 10;
      riskFactors.push(`High insider ownership: ${params.insiderSharePct}%.`);
    }
  } else {
    strengths.push(`Community-aligned allocation: Only ${params.insiderSharePct}% allocated to insiders.`);
  }
  checklist.push({
    id: 'insider',
    name: 'Insider Allocation (Team + VCs)',
    benchmark: '≤ 35% of total supply',
    actual: `${params.insiderSharePct}%`,
    passed: insiderPassed,
    impactScore: insiderPassed ? 0 : (params.insiderSharePct >= 50 ? 20 : 10),
    feedback: insiderPassed ? 'Strong majority reserved for community, liquidity, and ecosystem incentives.' : 'Insiders hold veto voting power and overwhelming sell capacity.',
  });

  // 5. Revenue / Value Accrual Sanity
  const fdvToRevenueMultiple = params.annualRevenueUSD > 0 ? params.fdvUSD / params.annualRevenueUSD : null;
  if (fdvToRevenueMultiple !== null && fdvToRevenueMultiple > 100) {
    score -= 10;
    riskFactors.push(`High Price-to-Sales multiple: ${(fdvToRevenueMultiple).toFixed(0)}x annual revenue.`);
  }

  score = Math.max(0, Math.min(100, score));

  let verdict: 'fair' | 'wait' | 'trap';
  let verdictLabel: string;

  if (score >= 70) {
    verdict = 'fair';
    verdictLabel = 'Fair & Sustainable Launch';
  } else if (score >= 45) {
    verdict = 'wait';
    verdictLabel = 'Overvalued: Wait for Post-Unlock Dip';
  } else {
    verdict = 'trap';
    verdictLabel = 'Predatory Low-Float Insider Trap';
  }

  return {
    score,
    verdict,
    verdictLabel,
    fdvToPeerRatio,
    fdvToRevenueMultiple,
    riskFactors,
    strengths,
    checklist,
  };
}

