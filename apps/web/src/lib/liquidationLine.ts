/**
 * Liquidation Line - Perpetual futures with leverage math
 * 
 * Pure calculation functions for liquidation line game. All formulas are
 * isolated in this module with detailed comments for clarity.
 */

export type PositionSide = 'long' | 'short';

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
}

export interface LiquidationConfig {
  initialBalance: number;
  mmr: number;
  leverageMin: number;
  leverageMax: number;
  marginStep: number;
  rounds: number;
  candlesPerRound: number;
  fundingInterval: number;
  candleSpeedMs: number;
  fundingEnabled: boolean;
  fundingRateBaseline: number;
}

export const LIQUIDATION_CONFIG: LiquidationConfig = {
  initialBalance: 1000,
  mmr: 0.005,
  leverageMin: 1,
  leverageMax: 50,
  marginStep: 100,
  rounds: 5,
  candlesPerRound: 30,
  fundingInterval: 5,
  candleSpeedMs: 250,
  fundingEnabled: true,
  fundingRateBaseline: 0.0001,
} as const;

/**
 * Position size = margin x leverage
 */
export function calculatePositionSize(margin: number, leverage: number): number {
  if (margin < 0 || leverage < 0) return 0;
  return margin * leverage;
}

/**
 * Long liquidation price = entry x (1 - 1/leverage + mmr)
 */
export function calculateLiquidationPriceLong(
  entryPrice: number,
  leverage: number,
  mmr: number = LIQUIDATION_CONFIG.mmr
): number {
  if (entryPrice <= 0 || leverage <= 0) return 0;
  const price = entryPrice * (1 - 1 / leverage + mmr);
  return price;
}

/**
 * Short liquidation price = entry x (1 + 1/leverage - mmr)
 */
export function calculateLiquidationPriceShort(
  entryPrice: number,
  leverage: number,
  mmr: number = LIQUIDATION_CONFIG.mmr
): number {
  if (entryPrice <= 0 || leverage <= 0) return Number.POSITIVE_INFINITY;
  const price = entryPrice * (1 + 1 / leverage - mmr);
  return price;
}

/**
 * PnL for long = size x (price - entry) / entry
 */
export function calculatePnLLong(
  positionSize: number,
  entryPrice: number,
  currentPrice: number
): number {
  if (entryPrice <= 0) return 0;
  return positionSize * (currentPrice - entryPrice) / entryPrice;
}

/**
 * PnL for short = size x (entry - price) / entry
 */
export function calculatePnLShort(
  positionSize: number,
  entryPrice: number,
  currentPrice: number
): number {
  if (entryPrice <= 0) return 0;
  return positionSize * (entryPrice - currentPrice) / entryPrice;
}

export function calculatePnL(
  side: PositionSide,
  positionSize: number,
  entryPrice: number,
  currentPrice: number
): number {
  if (side === 'long') {
    return calculatePnLLong(positionSize, entryPrice, currentPrice);
  }
  return calculatePnLShort(positionSize, entryPrice, currentPrice);
}

/**
 * Liquidation triggered by candle's wick (high/low), not just close
 */
export function isLiquidatedByCandle(
  side: PositionSide,
  liquidationPrice: number,
  candle: Candle
): boolean {
  if (side === 'long') {
    return candle.low <= liquidationPrice;
  } else {
    return candle.high >= liquidationPrice;
  }
}

/**
 * Funding = position size x funding rate
 */
export function calculateFunding(
  positionSize: number,
  fundingRate: number
): number {
  if (positionSize <= 0) return 0;
  return positionSize * fundingRate;
}

/**
 * Recalculate liquidation price after adding margin
 */
export function recalculateLiquidationPriceAfterMargin(
  side: PositionSide,
  entryPrice: number,
  leverage: number,
  additionalMargin: number,
  currentMargin: number,
  mmr: number = LIQUIDATION_CONFIG.mmr
): number {
  if (side === 'long') {
    return calculateLiquidationPriceLong(entryPrice, leverage, mmr);
  }
  return calculateLiquidationPriceShort(entryPrice, leverage, mmr);
}

export function generateCandle(
  prevClose: number,
  volatility: number,
  trend: number,
  rng: () => number
): Candle {
  const change = (rng() - 0.5) * 2 * volatility + trend;
  const open = prevClose;
  const close = prevClose * (1 + change);
  
  const range = Math.abs(close - open) * (0.5 + rng());
  const wickUp = rng() > 0.5 ? range * rng() : 0;
  const wickDown = rng() > 0.5 ? range * rng() : 0;
  
  const high = Math.max(open, close) + wickUp;
  const low = Math.min(open, close) - wickDown;
  
  return {
    open,
    high,
    low,
    close: Math.max(0.01, close),
    time: Date.now(),
  };
}