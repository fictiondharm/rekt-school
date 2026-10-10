/**
 * Calculates TVL (Total Value Locked): sum of asset amount * asset price
 */
export function getTVL(assets: { amount: number; price: number }[]): number {
  return assets.reduce((sum, asset) => {
    if (asset.amount < 0 || asset.price < 0) return sum;
    return sum + asset.amount * asset.price;
  }, 0);
}

/**
 * Calculates Market Capitalization: price * circulatingSupply
 */
export function getMarketCap(price: number, circulatingSupply: number): number {
  if (price < 0 || circulatingSupply < 0) return 0;
  return price * circulatingSupply;
}

/**
 * Calculates Fully Diluted Valuation (FDV): price * totalSupply
 */
export function getFDV(price: number, totalSupply: number): number {
  if (price < 0 || totalSupply < 0) return 0;
  return price * totalSupply;
}

/**
 * Calculates circulating float ratio: circulatingSupply / totalSupply
 */
export function getFloatPct(circulatingSupply: number, totalSupply: number): number {
  if (totalSupply <= 0 || circulatingSupply < 0) return 0;
  return Math.min(1, circulatingSupply / totalSupply);
}
