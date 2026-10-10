'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

type OrderType = 'market' | 'limit' | 'stop';

const BOOK_PRICES = [1.0, 1.01, 1.03, 1.06, 1.1];

export function P1Companion() {
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [size, setSize] = useState(4000);
  const [liquidity, setLiquidity] = useState(3000);
  const [limitPrice, setLimitPrice] = useState(1.0);
  const [stopPrice, setStopPrice] = useState(0.97);
  const [marketMove, setMarketMove] = useState(-5);

  const handleReset = () => {
    setOrderType('market');
    setSize(4000);
    setLiquidity(3000);
    setLimitPrice(1.0);
    setStopPrice(0.97);
    setMarketMove(-5);
  };

  const walkBook = (amount: number, askPrices: number[]) => {
    let remaining = amount;
    let cost = 0;
    let filled = 0;
    const fills: { price: number; take: number }[] = [];
    for (const p of askPrices) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, liquidity);
      cost += take * p;
      filled += take;
      remaining -= take;
      fills.push({ price: p, take });
    }
    const avg = filled > 0 ? cost / filled : 0;
    return { avg, filled, unfilled: remaining, cost };
  };

  // Market order: walk the book at current prices.
  const market = walkBook(size, BOOK_PRICES);
  const takerFee = market.cost * 0.001;

  // Limit order: a buy limit at or above best ask is marketable; below it rests.
  const isMarketableLimit = limitPrice >= BOOK_PRICES[0];
  const limitFill = isMarketableLimit
    ? walkBook(size, BOOK_PRICES.filter((p) => p <= limitPrice))
    : { avg: 0, filled: 0, unfilled: size, cost: 0 };
  const makerFee = limitFill.cost * 0.0002;

  // Stop order: fires only if the market moves down to/through the stop.
  const movedPrice = BOOK_PRICES[0] * (1 + marketMove / 100);
  const stopTriggered = movedPrice <= stopPrice;
  const stopFill = stopTriggered
    ? walkBook(size, BOOK_PRICES.map((p) => p * (1 + marketMove / 100)))
    : { avg: 0, filled: 0, unfilled: size, cost: 0 };

  const active =
    orderType === 'market'
      ? { avg: market.avg, filled: market.filled, unfilled: market.unfilled }
      : orderType === 'limit'
      ? { avg: limitFill.avg, filled: limitFill.filled, unfilled: limitFill.unfilled }
      : { avg: stopFill.avg, filled: stopFill.filled, unfilled: stopFill.unfilled };

  const slippagePct = active.avg > 0 ? ((active.avg - BOOK_PRICES[0]) / BOOK_PRICES[0]) * 100 : 0;
  const notFilled = active.filled === 0;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P1 &bull; ORDER DESK SIMULATOR
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Pick Your Order Type</h3>
        <p className="text-xs text-ink-soft">
          Walk a real order book and see how market, limit, and stop orders fill differently.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-xs">
          {(['market', 'limit', 'stop'] as OrderType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOrderType(t)}
              className={`p-2.5 rounded-lg border capitalize transition-all ${
                orderType === t
                  ? 'bg-accent/10 border-accent text-accent font-semibold'
                  : 'bg-bg border-border text-ink-soft hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Slider
          label="Order Size (tokens)"
          value={size}
          min={500}
          max={20000}
          step={500}
          unit="tokens"
          onChange={setSize}
        />
        <Slider
          label="Book Liquidity per level"
          value={liquidity}
          min={500}
          max={10000}
          step={500}
          unit="tokens"
          onChange={setLiquidity}
          helperText="Thin books slip more"
        />

        {orderType === 'limit' && (
          <Slider
            label="Your Limit Price"
            value={limitPrice}
            min={0.95}
            max={1.1}
            step={0.01}
            formatValue={(v) => `$${v.toFixed(2)}`}
            onChange={setLimitPrice}
          />
        )}
        {orderType === 'stop' && (
          <>
            <Slider
              label="Stop Trigger Price"
              value={stopPrice}
              min={0.9}
              max={0.99}
              step={0.01}
              formatValue={(v) => `$${v.toFixed(2)}`}
              onChange={setStopPrice}
            />
            <Slider
              label="Market Moves By"
              value={marketMove}
              min={-20}
              max={5}
              step={1}
              formatValue={(v) => `${v}%`}
              onChange={setMarketMove}
            />
          </>
        )}

        <div className="p-4 rounded-xl bg-bg border border-border space-y-2">
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Best ask (top of book)</span>
            <span className="font-mono font-semibold text-ink">$1.00</span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Your average fill</span>
            <span className="font-mono font-semibold text-ink">
              {notFilled ? '— not filled' : `$${active.avg.toFixed(4)}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Price impact (slippage)</span>
            <span
              className={`font-mono font-semibold ${
                slippagePct > 1 ? 'text-red-600' : slippagePct > 0.2 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {notFilled ? '—' : `${slippagePct >= 0 ? '+' : ''}${slippagePct.toFixed(2)}%`}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft pt-2 border-t border-border">
            <span>
              Fee ({orderType === 'market' || orderType === 'stop' ? 'taker 0.10%' : 'maker 0.02%'})
            </span>
            <span className="font-mono font-semibold text-ink">
              {orderType === 'market'
                ? `$${takerFee.toFixed(2)}`
                : orderType === 'limit'
                ? `$${makerFee.toFixed(2)}`
                : `$${(stopFill.cost * 0.001).toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {notFilled ? (
            <Badge variant="warn" className="text-[10px]">
              {orderType === 'stop' ? 'STOP NOT TRIGGERED' : 'RESTING — NOT FILLED'}
            </Badge>
          ) : active.unfilled > 0 ? (
            <Badge variant="danger" className="text-[10px]">
              PARTIAL FILL — {active.unfilled.toLocaleString()} tokens unfilled
            </Badge>
          ) : (
            <Badge variant="accent" className="text-[10px]">
              FULLY FILLED
            </Badge>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {notFilled ? (
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        ) : slippagePct > 1 ? (
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {orderType === 'market' &&
              (notFilled
                ? 'Your market order was larger than the entire visible book, so nothing (or only a sliver) filled. Thin liquidity cannot absorb size.'
                : slippagePct > 1
                ? `You crossed the spread and ate ${active.filled.toLocaleString()} tokens level by level, ending at an average of $${active.avg.toFixed(4)} - a ${slippagePct.toFixed(2)}% worse price than the $1.00 you saw. You paid the taker fee AND the slippage. This is the impatient trader's tax.`
                : `Your size fit near the top of the book, so your average fill ($${active.avg.toFixed(4)}) was close to the headline price. A market order guarantees execution, not a good price.`)}
            {orderType === 'limit' &&
              (notFilled
                ? `Your limit of $${limitPrice.toFixed(2)} sits ${((BOOK_PRICES[0] - limitPrice) * 100).toFixed(0)}¢ below the best ask, so it rests on the book unexecuted. You now wait - and if someone crosses into you, you pay the cheaper maker fee (or earn a rebate). Patience is the edge.`
                : `Your limit was at or above the best ask, so it filled immediately at market prices - a taker fill, not a rester. Set your limit below $${BOOK_PRICES[0].toFixed(2)} and you instead rest on the book as a maker, earning the cheaper 0.02% maker fee ($${makerFee.toFixed(2)}) versus the taker's 0.10% ($${takerFee.toFixed(2)}).`)}
            {orderType === 'stop' &&
              (stopTriggered
                ? `The market dropped ${marketMove}% to $${movedPrice.toFixed(4)}, tripping your stop at $${stopPrice.toFixed(2)}. Your stop became a market order and filled at an average of $${stopFill.avg.toFixed(4)} - possibly worse than your trigger, because a stop guarantees you TRY to exit, not the price you get.`
                : `The market moved to $${movedPrice.toFixed(4)}, which never reached your $${stopPrice.toFixed(2)} trigger. Your stop is still sleeping. Stops only fire on the trigger - they do not protect a position that drifts against you without touching the level.`)}
          </p>
        </div>
      </Card>
    </div>
  );
}
