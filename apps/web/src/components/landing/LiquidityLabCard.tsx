'use client';

import React from 'react';
import type { UseLiquidityLabResult } from '@/hooks/useLiquidityLab';
import { POOL_META, TRADE_SIZE, VERDICT_CLASSES } from '@/lib/liquidityLab';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const POOL_ORDER = ['shallow', 'deep'] as const;

export interface LiquidityLabCardProps {
  lab: UseLiquidityLabResult;
}

/**
 * Compact Liquidity Lab used on the homepage. The auto-play drives the slider
 * until the visitor grabs it, then the card explains what just happened.
 */
export function LiquidityLabCard({ lab }: LiquidityLabCardProps) {
  return (
    <div
      ref={lab.rootRef}
      className="flex flex-col gap-4 rounded-3xl border-2 border-ink bg-surface p-6 shadow-pop-pink"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-[22px] font-extrabold text-ink">Liquidity Lab</h3>
        <span className="rounded-full border-2 border-ink bg-quaternary px-3 py-1 text-[13px] font-bold text-ink">
          x · y = k · live
        </span>
      </div>

      <div role="group" aria-label="Pool depth" className="grid grid-cols-2 gap-2.5">
        {POOL_ORDER.map((pool) => {
          const active = lab.poolType === pool;
          return (
            <button
              key={pool}
              type="button"
              aria-pressed={active}
              onClick={() => lab.setPoolType(pool)}
              className={twMerge(
                clsx(
                  'rounded-2xl border-2 border-ink px-3.5 py-2.5 text-left text-[15px] font-bold leading-snug text-ink',
                  'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent',
                  active
                    ? pool === 'shallow'
                      ? 'bg-secondary shadow-pop-xs'
                      : 'bg-quaternary shadow-pop-xs'
                    : 'bg-surface'
                )
              )}
            >
              {POOL_META[pool].name}
              <span className="block text-xs font-medium text-ink-soft">
                {POOL_META[pool].reserves}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[13px] font-bold uppercase tracking-[0.06em]">
          <label htmlFor="landing-trade-size" className="text-ink">
            Trade size
          </label>
          <span className="text-ink">{lab.tradeAmount} fUSDC</span>
        </div>
        <input
          id="landing-trade-size"
          type="range"
          min={TRADE_SIZE.min}
          max={TRADE_SIZE.max}
          step={TRADE_SIZE.step}
          value={lab.tradeAmount}
          onChange={(event) => lab.setTradeAmount(Number(event.target.value))}
          onPointerDown={lab.stopAuto}
          className="h-8 w-full accent-[var(--accent-strong)]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-surface-muted px-4 py-3.5">
        <div>
          <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-ink-soft">
            Price impact
          </div>
          <div className="font-heading text-[48px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
            {lab.impactPct.toFixed(2)}%
          </div>
        </div>
        <div
          className={twMerge(
            clsx(
              '-rotate-4 rounded-full border-2 border-ink px-4 py-2 font-heading text-xl font-extrabold shadow-pop-xs',
              VERDICT_CLASSES[lab.verdict].badge
            )
          )}
        >
          {lab.verdict}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-[13px]">
        <div className="rounded-xl border-2 border-border px-2.5 py-2">
          <div className="font-medium text-ink-soft">Spot</div>
          <div className="mt-0.5 font-bold text-ink">${lab.spotPrice.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border-2 border-border px-2.5 py-2">
          <div className="font-medium text-ink-soft">You get</div>
          <div className="mt-0.5 font-bold text-ink">{lab.amountOut.toFixed(4)} SOL</div>
        </div>
        <div className="rounded-xl border-2 border-border px-2.5 py-2">
          <div className="font-medium text-ink-soft">0.3% fee</div>
          <div className="mt-0.5 font-bold text-ink">{lab.feeAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-[13px] font-bold">
        <div className="flex items-center justify-between">
          <span className="text-ink">Shallow</span>
          <span className="text-ink">{lab.shallowTrade.impactPct.toFixed(2)}%</span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full border-2 border-ink bg-surface-muted">
          <div
            className="h-full bg-secondary"
            style={{ width: `${lab.shallowBarWidth}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink">Deep</span>
          <span className="text-ink">{lab.deepTrade.impactPct.toFixed(2)}%</span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full border-2 border-ink bg-surface-muted">
          <div className="h-full bg-quaternary" style={{ width: `${lab.deepBarWidth}%` }} />
        </div>
      </div>
    </div>
  );
}
