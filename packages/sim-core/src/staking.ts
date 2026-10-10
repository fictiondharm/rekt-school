/**
 * Staking and Liquid Staking Math Engine
 * Follows Solana Proof-of-Stake consensus & LST yield-bearing pool economics.
 */

export interface StakingYieldParams {
  inflationRate: number; // e.g. 0.065 for 6.5%
  validatorCommission: number; // e.g. 0.08 for 8%
  compoundingPeriodsPerYear?: number; // Solana has ~146-182 epochs/year. Default: 182
}

export interface StakingCalculationResult {
  nominalAPR: number;
  netAPR: number;
  netAPY: number;
  rewardSOLPerYear: number;
  validatorFeePerYear: number;
}

/**
 * Calculates net staking APR and compounding APY after validator commission
 */
export function calculateStakingYield(
  principalSOL: number,
  params: StakingYieldParams
): StakingCalculationResult {
  const { inflationRate, validatorCommission, compoundingPeriodsPerYear = 182 } = params;

  if (principalSOL < 0) throw new Error('Principal SOL cannot be negative');
  if (inflationRate < 0) throw new Error('Inflation rate cannot be negative');
  if (validatorCommission < 0 || validatorCommission > 1) {
    throw new Error('Validator commission must be between 0 and 1');
  }

  const nominalAPR = inflationRate;
  const netAPR = nominalAPR * (1 - validatorCommission);
  
  // Compound interest formula: (1 + r/n)^n - 1
  const netAPY = Math.pow(1 + netAPR / compoundingPeriodsPerYear, compoundingPeriodsPerYear) - 1;

  const rewardSOLPerYear = principalSOL * netAPY;
  const grossReward = principalSOL * (Math.pow(1 + nominalAPR / compoundingPeriodsPerYear, compoundingPeriodsPerYear) - 1);
  const validatorFeePerYear = grossReward - rewardSOLPerYear;

  return {
    nominalAPR,
    netAPR,
    netAPY,
    rewardSOLPerYear,
    validatorFeePerYear,
  };
}

/**
 * Calculates LST exchange rate growth over time
 * Formula: E(t) = E_0 * (1 + netAPY)^years
 */
export function calculateLSTExchangeRate(
  initialRate: number = 1.0,
  netAPY: number,
  years: number
): number {
  if (years < 0) throw new Error('Years cannot be negative');
  if (initialRate <= 0) throw new Error('Initial rate must be greater than 0');
  return initialRate * Math.pow(1 + netAPY, years);
}

export interface LSTDepegAnalysis {
  fairValueSOL: number;
  secondaryMarketPriceSOL: number;
  depegDiscountPct: number;
  arbitrageProfitPct: number;
  isDepegged: boolean;
}

/**
 * Analyzes secondary market LST pricing vs. true underlying reserve redemption rate
 */
export function analyzeLSTDepeg(
  fairValueSOL: number,
  secondaryMarketPriceSOL: number
): LSTDepegAnalysis {
  if (fairValueSOL <= 0 || secondaryMarketPriceSOL <= 0) {
    throw new Error('Prices must be strictly positive');
  }

  // Depeg discount: (fair - market) / fair
  const depegDiscountPct = Math.max(0, ((fairValueSOL - secondaryMarketPriceSOL) / fairValueSOL) * 100);
  
  // If bought at market price and redeemed at fair value: (fair - market) / market
  const arbitrageProfitPct = Math.max(0, ((fairValueSOL - secondaryMarketPriceSOL) / secondaryMarketPriceSOL) * 100);
  
  // Considered materially depegged if discount > 1.5%
  const isDepegged = depegDiscountPct > 1.5;

  return {
    fairValueSOL,
    secondaryMarketPriceSOL,
    depegDiscountPct,
    arbitrageProfitPct,
    isDepegged,
  };
}
