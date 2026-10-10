/**
 * Lending & Money Market Mathematical Models (Aave / Kamino / Solend style)
 */

export interface KinkCurveConfig {
  baseRate: number; // R0 (e.g., 0.02 = 2%)
  optimalUtilization: number; // U_optimal (e.g., 0.80 = 80%)
  slope1: number; // R1 (e.g., 0.06 = 6% at optimal utilization)
  slope2: number; // R2 (e.g., 0.60 = 60% jump after optimal utilization)
  reserveFactor: number; // Protocol cut (e.g., 0.10 = 10%)
}

export const DEFAULT_LENDING_CONFIG: KinkCurveConfig = {
  baseRate: 0.02, // 2% base borrow rate
  optimalUtilization: 0.80, // 80% kink point
  slope1: 0.06, // +6% up to kink -> 8% borrow APR at 80%
  slope2: 0.70, // +70% steep curve beyond kink -> 78% borrow APR at 100%
  reserveFactor: 0.15, // 15% reserve cut
};

/**
 * Calculates the Utilization Rate U = totalBorrows / totalDeposits
 */
export function getUtilizationRate(totalDeposits: number, totalBorrows: number): number {
  if (totalDeposits <= 0) return 0;
  if (totalBorrows <= 0) return 0;
  return Math.min(1.0, totalBorrows / totalDeposits);
}

/**
 * Calculates Borrow APR using the piecewise Kinked Interest Rate Curve:
 * - If U <= U_optimal: R_borrow = R0 + (U / U_optimal) * R1
 * - If U > U_optimal: R_borrow = R0 + R1 + ((U - U_optimal) / (1 - U_optimal)) * R2
 */
export function getBorrowAPR(
  utilization: number,
  config: KinkCurveConfig = DEFAULT_LENDING_CONFIG
): number {
  const u = Math.max(0, Math.min(1, utilization));
  if (u <= config.optimalUtilization) {
    return config.baseRate + (u / config.optimalUtilization) * config.slope1;
  } else {
    const excess = (u - config.optimalUtilization) / (1 - config.optimalUtilization);
    return config.baseRate + config.slope1 + excess * config.slope2;
  }
}

/**
 * Calculates Supply APR:
 * Supply APR = Utilization * Borrow APR * (1 - Reserve Factor)
 */
export function getSupplyAPR(
  utilization: number,
  borrowAPR: number,
  reserveFactor: number = DEFAULT_LENDING_CONFIG.reserveFactor
): number {
  const u = Math.max(0, Math.min(1, utilization));
  return u * borrowAPR * (1 - reserveFactor);
}

/**
 * Generates curve points from 0% to 100% utilization for charting SVG curves.
 */
export function generateRateCurvePoints(
  config: KinkCurveConfig = DEFAULT_LENDING_CONFIG,
  steps: number = 20
): Array<{ utilization: number; borrowAPR: number; supplyAPR: number }> {
  const points: Array<{ utilization: number; borrowAPR: number; supplyAPR: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const borrow = getBorrowAPR(u, config);
    const supply = getSupplyAPR(u, borrow, config.reserveFactor);
    points.push({
      utilization: u,
      borrowAPR: borrow,
      supplyAPR: supply,
    });
  }
  return points;
}

/**
 * Health Factor & Liquidation Model
 */
export interface LoanPosition {
  collateralAmount: number; // e.g., 10 SOL
  collateralPrice: number; // e.g., $150
  borrowedDebt: number; // e.g., $1,000 USDC
  liquidationThreshold: number; // e.g., 0.80 (80%)
  maxLTV: number; // e.g., 0.75 (75%)
  liquidationBonus: number; // e.g., 0.05 (5% liquidator penalty/bonus)
}

/**
 * Calculates Position Health Factor:
 * HF = (Collateral Value * Liquidation Threshold) / Borrowed Debt
 */
export function getHealthFactor(position: LoanPosition): number {
  if (position.borrowedDebt <= 0) return 999.0;
  const collateralValue = position.collateralAmount * position.collateralPrice;
  if (collateralValue <= 0) return 0;
  return (collateralValue * position.liquidationThreshold) / position.borrowedDebt;
}

/**
 * Calculates the exact price at which the collateral gets liquidated (HF = 1.0)
 * P_liq = Borrowed Debt / (Collateral Amount * Liquidation Threshold)
 */
export function getLiquidationPrice(position: LoanPosition): number {
  if (position.collateralAmount <= 0 || position.liquidationThreshold <= 0) return 0;
  return position.borrowedDebt / (position.collateralAmount * position.liquidationThreshold);
}

/**
 * Simulates a Liquidation Execution:
 * When HF < 1.0, liquidator repays debt and seizes collateral at a discount (with bonus).
 */
export interface LiquidationResult {
  isLiquidatable: boolean;
  debtRepaid: number;
  collateralSeized: number;
  remainingCollateral: number;
  remainingDebt: number;
  liquidatorProfitUSD: number;
  newHealthFactor: number;
}

export function simulateLiquidation(
  position: LoanPosition,
  closeFactor: number = 0.50 // Standard: liquidator can repay up to 50% of debt
): LiquidationResult {
  const currentHF = getHealthFactor(position);
  if (currentHF >= 1.0) {
    return {
      isLiquidatable: false,
      debtRepaid: 0,
      collateralSeized: 0,
      remainingCollateral: position.collateralAmount,
      remainingDebt: position.borrowedDebt,
      liquidatorProfitUSD: 0,
      newHealthFactor: currentHF,
    };
  }

  // Liquidator repays up to closeFactor * borrowedDebt
  const debtRepaid = position.borrowedDebt * closeFactor;
  // Liquidator receives: debtRepaid * (1 + liquidationBonus) in value of collateral
  const seizedValueUSD = debtRepaid * (1 + position.liquidationBonus);
  const collateralSeized = Math.min(
    position.collateralAmount,
    seizedValueUSD / position.collateralPrice
  );

  const remainingCollateral = Math.max(0, position.collateralAmount - collateralSeized);
  const remainingDebt = Math.max(0, position.borrowedDebt - debtRepaid);
  const liquidatorProfitUSD = debtRepaid * position.liquidationBonus;

  const newPosition: LoanPosition = {
    ...position,
    collateralAmount: remainingCollateral,
    borrowedDebt: remainingDebt,
  };

  return {
    isLiquidatable: true,
    debtRepaid,
    collateralSeized,
    remainingCollateral,
    remainingDebt,
    liquidatorProfitUSD,
    newHealthFactor: getHealthFactor(newPosition),
  };
}

/**
 * Impermanent Loss Calculation:
 * r = P_new / P_old
 * IL = 2 * sqrt(r) / (1 + r) - 1
 */
export function getImpermanentLoss(priceRatio: number): number {
  if (priceRatio <= 0) return -1;
  return (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
}

/**
 * Net LP Return vs 50/50 Holding:
 * Net = Impermanent Loss + Fee Returns
 */
export function getNetLPReturn(priceRatio: number, feeReturnPct: number): number {
  const il = getImpermanentLoss(priceRatio);
  return il + feeReturnPct;
}
