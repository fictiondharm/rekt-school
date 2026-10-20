'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Character, type CharId } from '@/components/games/Character';
import type { Mood } from '@/lib/rugTycoon';
import { addLocalAura } from '@/lib/progress';
import {
  POOLS,
  POOL_CONFIG,
  STORAGE_KEYS,
  adjustedRatios,
  auraFor,
  dayStartLP,
  feeForDay,
  getScenario,
  hodlValueAt,
  lpValueAt,
  pickScenarioId,
  scenarioSeed,
  simulateRun,
  type PoolId,
  type RunResult,
  type ScenarioId,
  type Tranche,
} from '@/lib/poolParty';
import { ArrowLeft, Plus, RotateCcw, Share2, Wallet, Waves } from 'lucide-react';

type Phase = 'intro' | 'pool' | 'playing' | 'result';

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const fmtSigned = (n: number) =>
  (n >= 0 ? '+' : '-') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');

const RISK_DIALS: Record<PoolId, string> = {
  stable: 'Tiny fees, tinier IL',
  bluechip: 'Solid fees, steady IL',
  memecoin: 'Huge fees, brutal IL',
};

function readNumber(key: string, fallback = 0): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? parseInt(raw, 10) || 0 : fallback;
  } catch {
    return fallback;
  }
}

/** Price chart: start ratio + every day so far, drawn as a muted polyline. */
function PriceChart({ ratios, dayIndex }: { ratios: number[]; dayIndex: number }) {
  if (!ratios.length) return null;
  const points = [1, ...ratios.slice(0, dayIndex + 1)];
  const minR = Math.min(...points);
  const maxR = Math.max(...points);
  const span = Math.max(maxR - minR, 0.08);
  const pad = span * 0.12;
  const lo = minR - pad;
  const hi = maxR + pad;
  const x = (i: number) => (points.length === 1 ? 50 : (i / (points.length - 1)) * 96 + 2);
  const y = (r: number) => 30 - ((r - lo) / (hi - lo)) * 26;
  const poly = points.map((r, i) => `${x(i).toFixed(1)},${y(r).toFixed(1)}`).join(' ');
  const baseY = y(1).toFixed(1);
  const last = points[points.length - 1];

  return (
    <div className="g-chart">
      <svg viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
        <line x1="2" y1={baseY} x2="98" y2={baseY} className="g-chart-base" />
        <polyline points={poly} className="g-chart-line" />
        <circle cx={x(points.length - 1)} cy={y(last)} r="2" className="g-chart-dot" />
      </svg>
      <div className="g-chart-caption">
        <span>price vs start</span>
        <span>
          day {dayIndex + 1} · {last >= 1 ? '+' : ''}
          {(((last - 1) * 100).toFixed(0))}%
        </span>
      </div>
    </div>
  );
}

export function PoolParty() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [poolId, setPoolId] = useState<PoolId | null>(null);
  const [scenarioId, setScenarioId] = useState<ScenarioId | null>(null);
  const [ratios, setRatios] = useState<number[]>([]);
  const [dayIndex, setDayIndex] = useState(0);
  const [tranches, setTranches] = useState<Tranche[]>([]);
  const [reserve, setReserve] = useState<number>(POOL_CONFIG.reserve);
  const [fees, setFees] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [runCounter, setRunCounter] = useState(0);
  const [best, setBest] = useState(0);
  const [totalAura, setTotalAura] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const awardedRef = useRef(false);

  useEffect(() => {
    setBest(readNumber(STORAGE_KEYS.best));
    setTotalAura(readNumber(STORAGE_KEYS.aura));
    try {
      const seen = window.localStorage.getItem(STORAGE_KEYS.tutorialSeen) === '1';
      if (!seen) setTutorialOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const handleStart = () => {
    awardedRef.current = false;
    const nextCounter = runCounter + 1;
    setRunCounter(nextCounter);
    setScenarioId(pickScenarioId(scenarioSeed(nextCounter)));
    setPoolId(null);
    setRatios([]);
    setTranches([]);
    setReserve(POOL_CONFIG.reserve);
    setFees(0);
    setDayIndex(0);
    setResult(null);
    setPhase('pool');
  };

  const handlePickPool = (id: PoolId) => {
    if (!scenarioId) return;
    const rs = adjustedRatios(id, scenarioId);
    const tr = POOL_CONFIG.startingDeposit > 0 ? [{ value: POOL_CONFIG.startingDeposit, entryRatio: 1 }] : [];
    setPoolId(id);
    setRatios(rs);
    setTranches(tr);
    setReserve(POOL_CONFIG.reserve);
    setDayIndex(0);
    setFees(feeForDay(dayStartLP(tr, rs, 0), id, scenarioId, 0));
    setPhase('playing');
  };

  const finishRun = useCallback(
    (trs: Tranche[], feesNow: number, wd: number) => {
      if (!poolId || !scenarioId) return;
      const res = simulateRun(poolId, scenarioId, trs, feesNow, wd);
      const earned = auraFor(res.score);
      if (!awardedRef.current && earned > 0) {
        awardedRef.current = true;
        try {
          addLocalAura(earned);
          const nextAura = readNumber(STORAGE_KEYS.aura) + earned;
          window.localStorage.setItem(STORAGE_KEYS.aura, String(nextAura));
          setTotalAura(nextAura);
        } catch {
          /* ignore */
        }
      }
      if (res.score > best) {
        setBest(res.score);
        try {
          window.localStorage.setItem(STORAGE_KEYS.best, String(res.score));
        } catch {
          /* ignore */
        }
      }
      setResult(res);
      setPhase('result');
    },
    [poolId, scenarioId, best]
  );

  const advance = useCallback(
    (trs: Tranche[], feesNow: number) => {
      if (!poolId || !scenarioId) return;
      const next = dayIndex + 1;
      if (next >= POOL_CONFIG.days) {
        finishRun(trs, feesNow, POOL_CONFIG.days - 1);
        return;
      }
      const addFee = feeForDay(dayStartLP(trs, ratios, next), poolId, scenarioId, next);
      setTranches(trs);
      setFees(feesNow + addFee);
      setDayIndex(next);
    },
    [poolId, scenarioId, dayIndex, ratios, finishRun]
  );

  const handleStay = () => advance(tranches, fees);

  const handleAdd = () => {
    if (reserve < POOL_CONFIG.addAmount) return;
    const trs = [...tranches, { value: POOL_CONFIG.addAmount, entryRatio: ratios[dayIndex] }];
    setReserve(reserve - POOL_CONFIG.addAmount);
    advance(trs, fees);
  };

  const handleWithdraw = () => finishRun(tranches, fees, dayIndex);

  const handleShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const netLine = result
      ? `I finished ${fmtSigned(result.net)} vs just holding (${result.verdict.title})`
      : 'I survived six days at the pool';
    const text = `${netLine} in Pool Party on Rekt School. Think you can LP better? ${origin}/games/pool-party`;
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      try {
        window.prompt('Copy your result:', text);
      } catch {
        /* ignore */
      }
    }
  };

  const dismissTutorial = () => {
    setTutorialOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEYS.tutorialSeen, '1');
    } catch {
      /* ignore */
    }
  };

  const scenario = scenarioId ? getScenario(scenarioId) : null;
  const pool = poolId ? POOLS.find((p) => p.id === poolId) ?? null : null;
  const playing = phase === 'playing' && poolId && scenarioId && ratios.length > 0;
  const day = playing && scenario ? scenario.days[Math.min(dayIndex, scenario.days.length - 1)] : null;
  const curLP = playing ? lpValueAt(tranches, ratios[dayIndex]) : 0;
  const curHodl = playing ? hodlValueAt(tranches, ratios[dayIndex]) : 0;
  const prevR = dayIndex === 0 ? 1 : ratios[dayIndex - 1];
  const dayMood: Mood = playing && ratios[dayIndex] >= prevR ? 'buy' : 'walk';

  const chip =
    phase === 'result'
      ? 'Run complete'
      : phase === 'pool'
        ? 'Pick a pool'
        : playing
          ? `Day ${Math.min(dayIndex + 1, POOL_CONFIG.days)}/${POOL_CONFIG.days}`
          : 'Pool Party';

  return (
    <main className="g-shell-content">
      <div className="g-topline">
        <Link href="/games" className="g-backlink">
          <ArrowLeft size={14} /> Back to Games
        </Link>
        <span className="g-round-chip">{chip}</span>
      </div>

      {/* INTRO */}
      {phase === 'intro' && (
        <section className="g-panel">
          <div className="g-rugsy-row">
            <Character id="nina" mood="walk" size={96} title="Newbie Nina" />
            <div className="g-bubble">
              Everyone in the group chat says provide liquidity and print fees. Nobody ever
              mentions the other half of that trade. You start with $500 in the pool and $300
              on the side. Let us see what six days of market does to both.
            </div>
          </div>
          <div className="g-best-line">
            Best run: <strong>{best > 0 ? best.toLocaleString('en-US') : 'no runs yet'}</strong>
            {totalAura > 0 && <> · Aura earned: <strong>{totalAura}</strong></>}
          </div>
          <button type="button" className="g-btn g-btn-primary g-btn-wide" onClick={handleStart}>
            <Waves size={18} /> Jump in the pool
          </button>
        </section>
      )}

      {/* POOL SELECT */}
      {phase === 'pool' && scenario && (
        <section className="g-panel">
          <h1 className="g-title">Pick your pool</h1>
          <p className="g-sub">
            {scenario.name}: {scenario.blurb} Every pool trades the same week - the fees and the
            swings hit different.
          </p>
          <div className="g-pool-grid">
            {POOLS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="g-pool-card"
                onClick={() => handlePickPool(p.id)}
              >
                <span className="g-pool-risk">{p.risk}</span>
                <span className="g-pool-name">{p.name}</span>
                <span className="g-pool-tag">{p.tagline}</span>
                <span className="g-pool-blurb">{p.blurb}</span>
                <span className="g-pool-dial">{RISK_DIALS[p.id]}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* PLAYING: event + live panel + actions */}
      {playing && scenario && pool && day && (
        <>
          <section className="g-panel">
            <div className="g-event">
              <Character
                id={day.reactor as CharId}
                mood={dayMood}
                size={56}
                title={day.reactor}
              />
              <div className="g-event-body">
                <span className="g-event-chip">
                  Day {dayIndex + 1} · {scenario.name}
                </span>
                <h2 className="g-event-headline">{day.headline}</h2>
                <p className="g-event-note">{day.note}</p>
                <p className="g-event-line">
                  <b>{day.reactor}:</b> “{day.line}”
                </p>
              </div>
            </div>
          </section>

          <section className="g-panel">
            <h2 className="g-subhead">Your position</h2>
            <div className="g-stats">
              <div className="g-stat">
                <span className="g-stat-num">{fmt(curLP)}</span>
                <span className="g-stat-label">in the pool</span>
              </div>
              <div className="g-stat">
                <span className="g-stat-num">{fmt(fees)}</span>
                <span className="g-stat-label">fees earned</span>
              </div>
              <div className="g-stat">
                <span className="g-stat-num">{fmt(curHodl)}</span>
                <span className="g-stat-label">if you just held</span>
              </div>
            </div>

            <PriceChart ratios={ratios} dayIndex={dayIndex} />

            <div className="g-cash-line">
              <Wallet size={14} /> Cash on the side: <strong>{fmt(reserve)}</strong>
              {reserve >= POOL_CONFIG.addAmount && (
                <span className="g-muted"> · up to {reserve / POOL_CONFIG.addAmount} more add(s)</span>
              )}
            </div>

            <div className="g-btn-row">
              <button type="button" className="g-btn" onClick={handleStay}>
                Stay in
              </button>
              <button
                type="button"
                className="g-btn"
                onClick={handleAdd}
                disabled={reserve < POOL_CONFIG.addAmount}
              >
                <Plus size={16} /> Add {fmt(POOL_CONFIG.addAmount)}
              </button>
              <button type="button" className="g-btn g-btn-primary" onClick={handleWithdraw}>
                Withdraw all
              </button>
            </div>
            {dayIndex === 0 && (
              <p className="g-hint">
                Fees for today are already counted above. Leaving now locks in what you see.
              </p>
            )}
          </section>
        </>
      )}

      {/* RESULT */}
      {phase === 'result' && result && (
        <section className="g-panel g-graded">
          <div className="g-grade-badge">{result.verdict.title.toUpperCase()}</div>
          <h2 className="g-rank">{result.rank.title}</h2>
          <p className="g-sub">{result.rank.blurb}</p>

          <div className="g-stats">
            <div className="g-stat">
              <span className="g-stat-num">{fmtSigned(result.net)}</span>
              <span className="g-stat-label">vs just holding</span>
            </div>
            <div className="g-stat">
              <span className="g-stat-num">{fmt(result.fees)}</span>
              <span className="g-stat-label">fees earned</span>
            </div>
            <div className="g-stat">
              <span className="g-stat-num">{fmt(Math.abs(result.ilDollars))}</span>
              <span className="g-stat-label">impermanent loss</span>
            </div>
          </div>

          <div className="g-explain">
            <h3 className="g-subhead">What happened</h3>
            <p>{result.explanation}</p>
          </div>

          <div className="g-fine">
            {result.poolFit && (
              <div>
                + {POOL_CONFIG.poolFitBonus} pool fit bonus ({pool?.name} suits {scenario?.name})
              </div>
            )}
            {result.smartExit && (
              <div>
                + {POOL_CONFIG.smartWithdrawBonus} smart exit (you left with{' '}
                {fmt(result.lpValue + result.fees)} vs {fmt(result.counterfactual?.wealth ?? 0)}{' '}
                if you stayed)
              </div>
            )}
            {result.earlyWithdraw && !result.smartExit && result.counterfactual && (
              <div>
                Holding to the end would have netted {fmtSigned(result.counterfactual.net)} instead.
              </div>
            )}
            <div>
              Score {result.score.toLocaleString('en-US')} · Aura earned {auraFor(result.score)}
            </div>
          </div>

          <div className="g-learn-row">
            <Link href="/learn/b7" className="g-learn">
              How pool swaps actually work →
            </Link>
            <Link href="/learn/i4" className="g-learn">
              Impermanent loss, full math →
            </Link>
          </div>

          <div className="g-btn-row">
            <button type="button" className="g-btn g-btn-primary" onClick={handleShare}>
              <Share2 size={16} /> {shareCopied ? 'Copied!' : 'Share result'}
            </button>
            <button type="button" className="g-btn" onClick={handleStart}>
              <RotateCcw size={16} /> Play again
            </button>
            <Link href="/games" className="g-btn">
              <ArrowLeft size={16} /> Back to Games
            </Link>
          </div>
        </section>
      )}

      {/* TUTORIAL (first play only) */}
      {tutorialOpen && (
        <div className="g-tut-overlay" role="dialog" aria-modal="true" aria-label="How to play">
          <div className="g-tut">
            <h3 className="g-title">How Pool Party works</h3>
            <ul className="g-tut-list">
              <li>
                You put $500 into a 50/50 pool. Every day the pool trades, you earn a slice of
                the fees - as cash, not reinvested.
              </li>
              <li>
                Whenever the two tokens&apos; price ratio moves, impermanent loss quietly pulls
                your position below what a plain hold would be worth. Fees are the only thing
                that can outrun it.
              </li>
              <li>
                Each day, read the market, then Stay, Add $100 (up to three times), or Withdraw
                all and lock in the result.
              </li>
            </ul>
            <p className="g-tut-note">Fees are real. IL is real. The game is which one wins.</p>
            <button type="button" className="g-btn g-btn-primary g-btn-wide" onClick={dismissTutorial}>
              Got it, let me LP
            </button>
            <button type="button" className="g-tut-skip" onClick={dismissTutorial}>
              Skip tutorial
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
