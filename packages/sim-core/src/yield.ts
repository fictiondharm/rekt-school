/**
 * Fee APR: (volume24h * feeRate * 365) / TVL
 */
export function getFeeAPR(volume24h: number, feeRate: number, tvl: number): number {
  if (tvl <= 0 || volume24h <= 0 || feeRate <= 0) return 0;
  return (volume24h * feeRate * 365) / tvl;
}

/**
 * Reward APR: (rewardTokensPerDay * rewardTokenPrice * 365) / TVL
 */
export function getRewardAPR(
  rewardTokensPerDay: number,
  rewardTokenPrice: number,
  tvl: number
): number {
  if (tvl <= 0 || rewardTokensPerDay <= 0 || rewardTokenPrice <= 0) return 0;
  return (rewardTokensPerDay * rewardTokenPrice * 365) / tvl;
}

/**
 * Total APR: fee APR + reward APR
 */
export function getTotalAPR(feeAPR: number, rewardAPR: number): number {
  return feeAPR + rewardAPR;
}

/**
 * APY: (1 + APR / n)^n - 1
 * default n = 365 (daily compounding)
 */
export function getAPY(apr: number, compoundingPeriods: number = 365): number {
  if (apr <= 0) return 0;
  if (compoundingPeriods <= 0) return apr;
  return Math.pow(1 + apr / compoundingPeriods, compoundingPeriods) - 1;
}

/**
 * Simulates adding N users with average deposit amount.
 * As TVL grows while emission/fees change, returns the new diluted APR.
 */
export function simulateUserDilution(
  currentTVL: number,
  currentAPR: number,
  addedUsers: number,
  avgDepositPerUser: number = 1000
): { newTVL: number; newAPR: number; dilutionPct: number } {
  const addedTVL = Math.max(0, addedUsers) * avgDepositPerUser;
  const newTVL = currentTVL + addedTVL;
  if (newTVL <= 0) return { newTVL: 0, newAPR: 0, dilutionPct: 0 };

  // Total annual yield pool stays constant (or fixed emissions)
  const annualRewardPool = currentTVL * currentAPR;
  const newAPR = annualRewardPool / newTVL;
  const dilutionPct = currentAPR > 0 ? (currentAPR - newAPR) / currentAPR : 0;

  return { newTVL, newAPR, dilutionPct };
}
