'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, CheckCircle2, Layers } from 'lucide-react';

type Model = 'clob' | 'amm';

export function P2Companion() {
  const [model, setModel] = useState<Model>('clob');
  const [size, setSize] = useState(8000);
  const [depth, setDepth] = useState(6000);
  const [spreadBps, setSpreadBps] = useState(20);

  const handleReset = () => {
    setModel('clob');
    setSize(8000);
    setDepth(6000);
    setSpreadBps(20);
  };

  // ---- CLOB: discrete levels, step-by-step fill ----
  const bestAsk = 1 + spreadBps / 10000 / 2;
  const clobLevels = [0, 0.01, 0.02, 0.05, 0.1].map((inc) => bestAsk + inc);
  const clob = (() => {
    let remaining = size;
    let cost = 0;
    let filled = 0;
    const fills: { price: number; take: number }[] = [];
    for (const p of clobLevels) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, depth);
      cost += take * p;
      filled += take;
      remaining -= take;
      fills.push({ price: p, take });
    }
    const avg = filled > 0 ? cost / filled : 0;
    return { avg, filled, unfilled: remaining, cost };
  })();

  // ---- AMM: constant product, x*y=k ----
  const reserveA = depth; // base token reserve
  const reserveB = depth * 1.0; // quote reserve (spot $1.00)
  const amm = (() => {
    if (size >= reserveA) {
      // cannot extract more than reserve; cost approaches infinity
      const extractable = reserveA * 0.99;
      const cost = (reserveB * extractable) / (reserveA - extractable);
      return { avg: cost / extractable, filled: extractable, unfilled: size - extractable, cost };
    }
    const cost = (reserveB * size) / (reserveA - size);
    return { avg: cost / size, filled: size, unfilled: 0, cost };
  })();

  const active = model === 'clob' ? clob : amm;
  const refPrice = model === 'clob' ? bestAsk : 1.0;
  const impactPct = active.avg > 0 ? ((active.avg - refPrice) / refPrice) * 100 : 0;

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P2 &bull; DEPTH &amp; SPREAD
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Order Book vs AMM</h3>
        <p className="text-xs text-ink-soft">
          The same order, executed against a stepped order book or a smooth liquidity curve.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setModel('clob')}
            className={`p-2.5 rounded-lg border transition-all ${
              model === 'clob'
                ? 'bg-accent/10 border-accent text-accent font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            Order Book (CLOB)
          </button>
          <button
            type="button"
            onClick={() => setModel('amm')}
            className={`p-2.5 rounded-lg border transition-all ${
              model === 'amm'
                ? 'bg-accent/10 border-accent text-accent font-semibold'
                : 'bg-bg border-border text-ink-soft hover:text-ink'
            }`}
          >
            AMM (x &times; y = k)
          </button>
        </div>

        <Slider
          label="Your Order Size"
          value={size}
          min={1000}
          max={60000}
          step={1000}
          unit="tokens"
          onChange={setSize}
        />
        <Slider
          label={model === 'clob' ? 'Liquidity per Price Level' : 'Pool Reserve Size'}
          value={depth}
          min={2000}
          max={50000}
          step={1000}
          unit="tokens"
          onChange={setDepth}
          helperText={model === 'clob' ? 'Depth = the cushion' : 'Bigger pool = flatter curve'}
        />
        {model === 'clob' && (
          <Slider
            label="Spread (best ask − best bid)"
            value={spreadBps}
            min={1}
            max={200}
            step={1}
            formatValue={(v) => `${(v / 100).toFixed(2)}%`}
            onChange={setSpreadBps}
          />
        )}

        {model === 'clob' ? (
          <div className="p-4 rounded-xl bg-bg border border-border space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <Layers className="w-3 h-3" /> Book walk ({clob.filled.toLocaleString()} filled)
            </span>
            {clobLevels.map((p, i) => {
              const take = clob.filled > i * depth ? Math.min(depth, clob.filled - i * depth) : 0;
              return (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-ink-soft w-16">${p.toFixed(3)}</span>
                  <div className="flex-1 h-2.5 bg-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60"
                      style={{ width: `${Math.min(100, (take / Math.max(size, 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-ink-soft w-16 text-right">
                    {take.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-bg border border-border space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">
              Curve slide (spot $1.00 → fill ${active.avg.toFixed(4)})
            </span>
            <div className="flex items-end gap-0.5 h-16">
              {Array.from({ length: 24 }).map((_, i) => {
                const t = i / 23;
                const h = 8 + t * 52;
                const past = t * (size / Math.max(depth, 1));
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${past > 0 ? 'bg-accent/70' : 'bg-border/60'}`}
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-ink-soft">
              Trading {size.toLocaleString()} into a {depth.toLocaleString()} pool bends you up the curve.
            </p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-bg border border-border space-y-2">
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>{model === 'clob' ? 'Best ask' : 'Spot price'}</span>
            <span className="font-mono font-semibold text-ink">${refPrice.toFixed(3)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Average fill</span>
            <span className="font-mono font-semibold text-ink">${active.avg.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft">
            <span>Price impact</span>
            <span
              className={`font-mono font-semibold ${
                impactPct > 5 ? 'text-red-600' : impactPct > 1 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              +{impactPct.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-ink-soft pt-2 border-t border-border">
            <span>Total cost</span>
            <span className="font-mono font-semibold text-ink">${active.cost.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {model === 'clob'
              ? impactPct > 3
                ? `You walked the book level by level: $${bestAsk.toFixed(3)}, then $${clobLevels[1].toFixed(3)}, and so on. Because each level only held ${depth.toLocaleString()} tokens, your ${size.toLocaleString()}-token order climbed the stack and averaged $${clob.avg.toFixed(4)} - a stepped +${impactPct.toFixed(2)}% impact. Order book punishment is jagged: flat within a level, then a jump.${clob.unfilled > 0 ? ` Worse, ${clob.unfilled.toLocaleString()} tokens never filled at all - the book ran out.` : ''}`
                : `Your order fit inside the top levels, so the stepped book barely moved: average $${clob.avg.toFixed(4)} (+${impactPct.toFixed(2)}%). Depth is the cushion under every fill - a deep book absorbs size without punishing you.`
              : `The AMM has no levels, just one curve. Your ${size.toLocaleString()}-token buy shifted the reserve ratio and slid you up x×y=k to an average of $${amm.avg.toFixed(4)} (+${impactPct.toFixed(2)}%). Small trades glide; large trades bend the curve hard. That smooth, continuous impact is the defining difference from a stepped order book.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
