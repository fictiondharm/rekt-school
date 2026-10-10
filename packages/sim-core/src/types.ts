export interface Sim<S, A, R> {
  init(config?: unknown): S;
  reduce(state: S, action: A): S;
  derive(state: S): R;
}

export interface PoolReserves {
  reserveA: number;
  reserveB: number;
}

export interface SwapResult {
  amountIn: number;
  amountOut: number;
  executionPrice: number;
  priceImpact: number;
  feeAmount: number;
  newReserveA: number;
  newReserveB: number;
}
