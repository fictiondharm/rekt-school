import { describe, it, expect } from 'vitest';
import {
  calculateLiquidationPriceLong,
  calculateLiquidationPriceShort,
  isLiquidatedByCandle,
} from './liquidationLine';

describe('Liquidation Line Math', () => {
  it('liquidation price for 10x long at entry 100 with mmr 0.5%', () => {
    const liqPrice = calculateLiquidationPriceLong(100, 10, 0.005);
    expect(liqPrice).toBeCloseTo(90.5, 10);
  });

  it('liquidation price for 5x short', () => {
    const liqPrice = calculateLiquidationPriceShort(100, 5, 0.005);
    expect(liqPrice).toBeCloseTo(119.5, 10);
  });

  it('liquidation price for 50x long', () => {
    const liqPrice = calculateLiquidationPriceLong(100, 50, 0.005);
    expect(liqPrice).toBeCloseTo(98.5, 10);
  });

  it('wick through liquidation price triggers liquidation even if close is above it', () => {
    const liqPrice = 90.5;
    const candle = {
      open: 95,
      high: 96,
      low: 90,
      close: 95,
      time: Date.now(),
    };
    expect(isLiquidatedByCandle('long', liqPrice, candle)).toBe(true);
  });
});