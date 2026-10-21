'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Character } from '@/components/games/Character';
import { addLocalAura } from '@/lib/progress';
import {
  LIQUIDATION_CONFIG,
  calculatePositionSize,
  calculateLiquidationPriceLong,
  calculateLiquidationPriceShort,
  calculatePnL,
  isLiquidatedByCandle,
  calculateFunding,
  generateCandle,
  type Candle,
  type PositionSide,
} from '@/lib/liquidationLine';
import { ArrowLeft, Play, Pause, Share2, RotateCcw, Plus } from 'lucide-react';

export const GAME_REQUIRES_UNLOCK = false;
type Phase = 'intro' | 'setup' | 'trading' | 'roundResult' | 'final';

interface Position {
  side: PositionSide;
  margin: number;
  leverage: number;
  entryPrice: number;
  positionSize: number;
  liquidationPrice: number;
  entryCandleIndex: number;
  fundingPaid: number;
  opened: boolean;
}

interface RoundState {
  candles: Candle[];
  currentIndex: number;
  fundingEvents: number[];
  liquidated: boolean;
  liquidationCandleIndex: number | null;
  pnl: number;
  fundingPaidTotal: number;
}

interface ScenarioConfig {
  name: string;
  description: string;
  startPrice: number;
  volatility: number;
  trend: number;
  fundingBias: number;
  hasWickEvent: boolean;
  wickConfig?: { candleIndex: number; direction: 'up' | 'down'; magnitude: number };
}

const STORAGE_KEYS = {
  best: 'defi_maxi_liquidation_line_best',
  aura: 'defi_maxi_liquidation_line_aura',
  tutorialSeen: 'defi_maxi_liquidation_line_tut_seen',
};

const RANK_TITLES = [
  { minBalance: 0, title: 'Liquidated Lunch', blurb: 'You got rekt by the wicks.' },
  { minBalance: 800, title: 'Wick Dodger', blurb: 'You survived a few rounds.' },
  { minBalance: 1200, title: 'Exit liquidity', blurb: 'You took profits when it mattered.' },
  { minBalance: 1500, title: 'Survived the wicks', blurb: 'Calm hands through chaos.' },
  { minBalance: 2000, title: 'Perp Veteran', blurb: 'Disciplined risk management.' },
];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getRoundScenarios(roundIndex: number): ScenarioConfig[] {
  if (roundIndex === 0) {
    return [{ name: 'Calm uptrend', description: 'Steady climb, low volatility', startPrice: 100, volatility: 0.01, trend: 0.002, fundingBias: 0.1, hasWickEvent: false }];
  } else if (roundIndex === 1) {
    return [{ name: 'Choppy sideways with fake-outs', description: 'Range-bound with sudden spikes', startPrice: 105, volatility: 0.015, trend: 0, fundingBias: 0, hasWickEvent: true, wickConfig: { candleIndex: 10, direction: 'up', magnitude: 0.03 } }];
  } else if (roundIndex === 2) {
    return [{ name: 'Slow grind then a sudden wick down (\"Wanda dumps\")', description: 'False calm before the dump', startPrice: 108, volatility: 0.008, trend: 0.001, fundingBias: -0.2, hasWickEvent: true, wickConfig: { candleIndex: 20, direction: 'down', magnitude: 0.08 } }];
  } else if (roundIndex === 3) {
    return [{ name: 'High funding crowded long, price drifts flat (funding drains the long)', description: 'Crowded trade pays funding', startPrice: 104, volatility: 0.006, trend: 0, fundingBias: -0.3, hasWickEvent: false }];
  } else {
    return [{ name: 'Violent pump and crash', description: 'Extreme volatility', startPrice: 106, volatility: 0.025, trend: 0, fundingBias: 0, hasWickEvent: true, wickConfig: { candleIndex: 15, direction: 'up', magnitude: 0.06 } }];
  }
}

function fmt(n: any): string {
  if (typeof n === 'number' && !isNaN(n)) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  console.error('LL_FMT_UNDEF', n);
  return '--';
}

function buildLesson(roundState: RoundState, position: Position | null, pnl: number): { lesson: string; lessonId: string } {
  if (roundState.liquidated) {
    return {
      lesson: 'A candle wick hit your liquidation price and wiped your entire margin. At high leverage a brief spike is enough — liquidation triggers on wicks (highs/lows), not just closes.',
      lessonId: 'i2',
    };
  }
  if (roundState.fundingPaidTotal > 0) {
    return {
      lesson: 'You survived, but funding fees slowly drained your position. When one side is crowded, it pays the other side every funding interval.',
      lessonId: 'b9',
    };
  }
  if (position && pnl > 0) {
    return {
      lesson: 'You closed in profit. Size and leverage that let you survive the wicks are what keep you in the game long enough for a good trade to pay off.',
      lessonId: 'i3',
    };
  }
  if (position && pnl <= 0) {
    return {
      lesson: 'Price moved against your position but you were not liquidated. Cutting a loss early is far better than holding until a wick takes everything.',
      lessonId: 'b6',
    };
  }
  return {
    lesson: 'You sat out this round. No trade is also a position — avoiding forced liquidation is a skill in itself.',
    lessonId: 'i3',
  };
}

function readNumber(key: string, fallback = 0): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? parseInt(raw, 10) || 0 : fallback;
  } catch {
    return fallback;
  }
}
export function LiquidationLine() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [roundIndex, setRoundIndex] = useState(0);
  const [balance, setBalance] = useState(LIQUIDATION_CONFIG.initialBalance);
  const [position, setPosition] = useState<Position | null>(null);
  const [roundState, setRoundState] = useState<RoundState | null>(null);
  const [paused, setPaused] = useState(false);
  const [side, setSide] = useState<PositionSide>('long');
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState(100);
  const [scenario, setScenario] = useState<ScenarioConfig | null>(null);
  const [best, setBest] = useState(0);
  const [totalAura, setTotalAura] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [roundResults, setRoundResults] = useState<any[]>([]);
  const [lastRoundResult, setLastRoundResult] = useState<any>(null);
  const [reactCharacter, setReactCharacter] = useState<'wanda' | 'liquidator' | null>(null);
  const awardedRef = useRef(false);

  useEffect(() => {
    setBest(readNumber(STORAGE_KEYS.best));
    setTotalAura(readNumber(STORAGE_KEYS.aura));
    try {
      const seen = window.localStorage.getItem(STORAGE_KEYS.tutorialSeen) === '1';
      if (!seen) setTutorialOpen(true);
    } catch {}
  }, []);

  const positionSize = useMemo(() => calculatePositionSize(margin, leverage), [margin, leverage]);

  const liquidationPricePreview = useMemo(() => {
    const basePrice = scenario?.startPrice ?? 100;
    return side === 'long'
      ? calculateLiquidationPriceLong(basePrice, leverage)
      : calculateLiquidationPriceShort(basePrice, leverage);
  }, [side, leverage, scenario]);

  const handleStart = () => {
    awardedRef.current = false;
    setRoundIndex(0);
    setBalance(LIQUIDATION_CONFIG.initialBalance);
    setPosition(null);
    setRoundState(null);
    setRoundResults([]);
    setLastRoundResult(null);
    setPhase('setup');
  };

  const startRound = () => {
    const scenarios = getRoundScenarios(roundIndex);
    const seed = hashSeed(roundIndex + '-' + Date.now());
    const rng = mulberry32(seed);
    const chosenScenario = scenarios[Math.floor(rng() * scenarios.length)];
    setScenario(chosenScenario);

    const candles: Candle[] = [];
    let prevClose = chosenScenario.startPrice;
    for (let i = 0; i < LIQUIDATION_CONFIG.candlesPerRound; i++) {
      let candle = generateCandle(prevClose, chosenScenario.volatility, chosenScenario.trend, rng);
      if (chosenScenario.hasWickEvent && chosenScenario.wickConfig && chosenScenario.wickConfig.candleIndex === i) {
        if (chosenScenario.wickConfig.direction === 'down') {
          candle.low = prevClose * (1 - chosenScenario.wickConfig.magnitude);
          candle.high = Math.max(candle.open, candle.close) * 1.01;
          setReactCharacter('wanda');
          setTimeout(() => setReactCharacter(null), 1500);
        } else if (chosenScenario.wickConfig.direction === 'up') {
          candle.high = prevClose * (1 + chosenScenario.wickConfig.magnitude);
          candle.low = Math.min(candle.open, candle.close) * 0.99;
        }
      }
      candles.push(candle);
      prevClose = candle.close;
    }

    setRoundState({
      candles,
      currentIndex: 0,
      fundingEvents: [],
      liquidated: false,
      liquidationCandleIndex: null,
      pnl: 0,
      fundingPaidTotal: 0,
    });
    setPhase('trading');
    setPaused(false);
  };

  const openPosition = () => {
    if (!roundState || !scenario) return;
    const currentCandle = roundState.candles[roundState.currentIndex];
    const entryPrice = currentCandle.close;
    const posSize = calculatePositionSize(margin, leverage);
    let liqPrice: number;
    if (side === 'long') {
      liqPrice = calculateLiquidationPriceLong(entryPrice, leverage);
    } else {
      liqPrice = calculateLiquidationPriceShort(entryPrice, leverage);
    }

    setPosition({
      side,
      margin,
      leverage,
      entryPrice,
      positionSize: posSize,
      liquidationPrice: liqPrice,
      entryCandleIndex: roundState.currentIndex,
      fundingPaid: 0,
      opened: true,
    });
  };

  const closePosition = (partial = false) => {
    if (!position || !roundState) return;
    const currentCandle = roundState.candles[roundState.currentIndex];
    const pnl = calculatePnL(position.side, position.positionSize, position.entryPrice, currentCandle.close);
    const closeAmount = partial ? 0.5 : 1.0;
    const realizedPnl = pnl * closeAmount;
    
    if (partial) {
      setPosition({
        ...position,
        positionSize: position.positionSize * 0.5,
        margin: position.margin * 0.5,
      });
      setBalance(balance + realizedPnl);
    } else {
      setBalance(balance + position.margin + realizedPnl);
      setPosition(null);
    }
  };

  const addMargin = () => {
    if (!position) return;
    const addAmount = 100;
    if (balance < addAmount) return;
    setBalance(balance - addAmount);
    setPosition({
      ...position,
      margin: position.margin + addAmount,
      positionSize: position.positionSize + addAmount * position.leverage,
    });
  };

  useEffect(() => {
    if (phase !== 'trading' || paused || !roundState) return;
    const id = setInterval(() => {
      setRoundState((prev) => {
        if (!prev) return prev;
        if (prev.currentIndex >= prev.candles.length - 1) {
          return prev;
        }
        
        const nextIndex = prev.currentIndex + 1;
        const nextCandle = prev.candles[nextIndex];
        
        if (position && !prev.liquidated) {
          if (isLiquidatedByCandle(position.side, position.liquidationPrice, nextCandle)) {
            setReactCharacter('liquidator');
            setTimeout(() => setReactCharacter(null), 2000);
            setPosition(null);
            return {
              ...prev,
              currentIndex: nextIndex,
              liquidated: true,
              liquidationCandleIndex: nextIndex,
            };
          }
        }
        
        let fundingPaidTotal = prev.fundingPaidTotal;
        if (position && (nextIndex % LIQUIDATION_CONFIG.fundingInterval === 0) && scenario) {
          const fundingRate = LIQUIDATION_CONFIG.fundingRateBaseline * (scenario.fundingBias || 1);
          const funding = calculateFunding(position.positionSize, fundingRate);
          if (scenario.fundingBias < 0 && position.side === 'long') {
            fundingPaidTotal += funding;
            setBalance((b) => b - funding);
          } else if (scenario.fundingBias > 0 && position.side === 'short') {
            fundingPaidTotal += funding;
            setBalance((b) => b - funding);
          }
        }
        
        return {
          ...prev,
          currentIndex: nextIndex,
          fundingPaidTotal,
        };
      });
    }, LIQUIDATION_CONFIG.candleSpeedMs);

    return () => clearInterval(id);
  }, [phase, paused, position, scenario]);

  useEffect(() => {
    if (phase !== 'trading' || !roundState) return;
    if (roundState.currentIndex >= roundState.candles.length - 1 && roundState.candles.length > 0) {
      setTimeout(() => {
        const currentCandle = roundState.candles[roundState.currentIndex];
        let pnl = 0;
        if (position && !roundState.liquidated) {
          pnl = calculatePnL(position.side, position.positionSize, position.entryPrice, currentCandle.close);
          setBalance((b) => b + position.margin + pnl);
        }
        
        const result = {
          round: roundIndex + 1,
          liquidated: roundState.liquidated,
          liquidationCandleIndex: roundState.liquidationCandleIndex,
          pnl: position ? pnl : 0,
          fundingPaid: roundState.fundingPaidTotal,
          balanceChange: (position && !roundState.liquidated) ? position.margin + pnl : (roundState.liquidated ? -(position?.margin || 0) : 0),
          ...buildLesson(roundState, position, pnl),
        };
        
        setLastRoundResult(result);
        setRoundResults((prev) => [...prev, result]);
        setPosition(null);
        setPhase('roundResult');
      }, 500);
    }
  }, [roundState?.currentIndex]);

  const nextRound = () => {
    if (roundIndex < LIQUIDATION_CONFIG.rounds - 1) {
      setRoundIndex(roundIndex + 1);
      setPosition(null);
      setRoundState(null);
      setPhase('setup');
    } else {
      finalizeGame();
    }
  };

  const finalizeGame = () => {
    const totalBalance = balance;
    
    let rank = RANK_TITLES[0];
    for (const r of RANK_TITLES) {
      if (totalBalance >= r.minBalance) rank = r;
    }
    
    const earned = Math.max(0, Math.floor((totalBalance - 1000) / 50));
    if (!awardedRef.current && earned > 0) {
      awardedRef.current = true;
      try {
        addLocalAura(earned);
        const nextAura = readNumber(STORAGE_KEYS.aura) + earned;
        window.localStorage.setItem(STORAGE_KEYS.aura, String(nextAura));
        setTotalAura(nextAura);
      } catch {}
    }
    
    if (totalBalance > best) {
      setBest(totalBalance);
      try {
        window.localStorage.setItem(STORAGE_KEYS.best, String(totalBalance));
      } catch {}
    }
    
    setPhase('final');
  };

  const handleShare = async () => {
    const text = 'I survived ' + roundResults.filter((r) => !r.liquidated).length + ' rounds of leverage in Liquidation Line on Rekt School https://rekt.school/games/liquidation-line';
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {}
  };

  const dismissTutorial = () => {
    setTutorialOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEYS.tutorialSeen, '1');
    } catch {}
  };

  const currentPrice = roundState && roundState.candles[roundState.currentIndex] 
    ? roundState.candles[roundState.currentIndex].close 
    : (scenario?.startPrice || 100);

  return (
    <main className='g-shell-content'>
      <div className='g-topline'>
        <Link href='/games' className='g-backlink'>
          <ArrowLeft size={14} /> Back to Arcade
        </Link>
        <span className='g-round-chip'>
          Balance: {fmt(balance)} {phase === 'trading' ? ' | Round ' + (roundIndex + 1) + '/5' : ''}
        </span>
      </div>

      {phase === 'intro' && (
        <section className='g-panel'>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <Character id='liquidator' mood='walk' size={80} />
            <h1 className='g-title'>Liquidation Line</h1>
            <p className='g-sub'>
              Perpetual futures with leverage. Trade a fictional perp over 5 rounds.
              Candle wicks hunt liquidations. Isolated margin, funding, real risk.
            </p>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Simulation. Not trading advice.</p>
            <button type='button' className='g-btn g-btn-primary g-btn-wide' onClick={handleStart}>
              Start Trading
            </button>
          </div>
        </section>
      )}

      {phase === 'setup' && (
        <section className='g-panel'>
          <h2 className='g-title'>Round {roundIndex + 1} - Setup</h2>
          <p className='g-sub'>{getRoundScenarios(roundIndex)[0].name}</p>
          <p className='g-sub' style={{ fontSize: '12px' }}>{getRoundScenarios(roundIndex)[0].description}</p>

          <div className='g-toggle-row' style={{ justifyContent: 'center' }}>
            <button type='button' className={'g-toggle ' + (side === 'long' ? 'g-toggle-on' : 'g-toggle-off')} onClick={() => setSide('long')}>
              Long
            </button>
            <button type='button' className={'g-toggle ' + (side === 'short' ? 'g-toggle-on' : 'g-toggle-off')} onClick={() => setSide('short')}>
              Short
            </button>
          </div>

          <label className='g-field'>
            <span className='g-field-label'>Leverage <b>{leverage}x</b></span>
            <input type='range' className='g-range' min={LIQUIDATION_CONFIG.leverageMin} max={LIQUIDATION_CONFIG.leverageMax} step={1} value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} />
          </label>

          <label className='g-field'>
            <span className='g-field-label'>Margin <b>${fmt(margin)}</b></span>
            <input type='range' className='g-range' min={LIQUIDATION_CONFIG.marginStep} max={Math.min(1000, balance)} step={LIQUIDATION_CONFIG.marginStep} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
          </label>

          <div style={{ background: '#1a1a1a', padding: '12px', border: '1px solid #333', fontSize: '12px' }}>
            <div>Position Size: <strong>${fmt(positionSize)}</strong></div>
            <div>Fictional PERP-WICK / FICT-BTC</div>
            <div>Liquidation Price: <strong>${fmt(liquidationPricePreview)}</strong></div>
          </div>

          <button type='button' className='g-btn g-btn-primary g-btn-wide' onClick={startRound}>
            <Play size={18} /> Start Round
          </button>
        </section>
      )}

      {phase === 'trading' && roundState && (
        <section className='g-panel'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>PERP-WICK / FICT-BTC</div>
              <div style={{ fontSize: '24px', fontFamily: 'monospace' }}>${fmt(currentPrice)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px' }}>Candle {roundState.currentIndex + 1}/{roundState.candles.length}</div>
              {position && (
                <div style={{ fontSize: '11px', color: position.side === 'long' ? '#4ade80' : '#f87171' }}>
                  {position.side.toUpperCase()} {position.leverage}x | Liq: ${fmt(position.liquidationPrice)}
                </div>
              )}
            </div>
          </div>

          {reactCharacter && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#2a1810', border: '1px solid #8b4513' }}>
              <Character id={reactCharacter} mood='walk' size={40} />
              <span style={{ fontSize: '12px' }}>
                {reactCharacter === 'wanda' ? 'Whale Wanda dumps!' : 'Liquidator bot hunting...'}
              </span>
            </div>
          )}

          <div style={{ position: 'relative', background: '#0a0a0a', padding: '12px', border: '1px solid #333', height: '160px', display: 'flex', alignItems: 'end', gap: '2px', overflow: 'hidden' }}>
            {position && scenario && (() => {
              const visible = roundState.candles.slice(0, roundState.currentIndex + 1);
              const highs = visible.map((c) => c.high).concat([position.entryPrice, position.liquidationPrice]);
              const lows = visible.map((c) => c.low).concat([position.entryPrice, position.liquidationPrice]);
              const priceHigh = Math.max(...highs);
              const priceLow = Math.min(...lows);
              const priceRange = Math.max(0.0001, priceHigh - priceLow);
              const chartHeight = 120;
              const yOf = (price: number) => ((priceHigh - price) / priceRange) * chartHeight;
              return (
                <>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: yOf(position.entryPrice) + 'px', borderTop: '1px dashed #888' }}>
                    <span style={{ position: 'absolute', right: '4px', top: '-11px', fontSize: '9px', color: '#888' }}>Entry ${fmt(position.entryPrice)}</span>
                  </div>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: yOf(position.liquidationPrice) + 'px', borderTop: '1px solid #ff0000' }}>
                    <span style={{ position: 'absolute', right: '4px', top: '-11px', fontSize: '9px', color: '#ff0000' }}>Liq ${fmt(position.liquidationPrice)}</span>
                  </div>
                </>
              );
            })()}
            {roundState.candles.slice(0, roundState.currentIndex + 1).map((candle, idx) => {
              const isUp = candle.close >= candle.open;
              const color = isUp ? '#4ade80' : '#f87171';
              const isLiqCandle = roundState.liquidated && roundState.liquidationCandleIndex === idx;
              const range = Math.max(0.0001, candle.high - candle.low);
              const bodyTop = Math.max(candle.open, candle.close);
              const bodyBottom = Math.min(candle.open, candle.close);
              const chartHeight = 120;
              return (
                <div key={idx} style={{ position: 'relative', width: '8px', height: chartHeight + 'px', flex: '0 0 auto' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '1px',
                      background: isLiqCandle ? '#ff0000' : color,
                      top: ((candle.high - bodyTop) / range) * chartHeight + 'px',
                      height: (Math.max(0.0001, bodyTop - bodyBottom) / range) * chartHeight + 'px',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '0',
                      width: '8px',
                      background: isLiqCandle ? '#ff0000' : color,
                      top: ((candle.high - bodyTop) / range) * chartHeight + 'px',
                      height: Math.max(2, (Math.abs(candle.close - candle.open) / range) * chartHeight) + 'px',
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {!position ? (
              <button type='button' className='g-btn g-btn-primary' onClick={openPosition}>
                Open {side.toUpperCase()} {leverage}x (${fmt(margin)} margin)
              </button>
            ) : (
              <>
                <button type='button' className='g-btn' onClick={() => closePosition(false)}>Close all</button>
                <button type='button' className='g-btn' onClick={() => closePosition(true)}>Close half</button>
                <button type='button' className='g-btn' onClick={addMargin}><Plus size={14} /> Add $100 margin</button>
              </>
            )}
            <button type='button' className='g-btn' onClick={() => setPaused(!paused)}>
              {paused ? <Play size={14} /> : <Pause size={14} />} {paused ? 'Resume' : 'Pause'}
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>Simulation. Not trading advice.</div>
        </section>
      )}

      {phase === 'roundResult' && lastRoundResult && (
        <section className='g-panel'>
          <h2 className='g-title'>Round {lastRoundResult.round} Result</h2>
          {lastRoundResult.liquidated ? (
            <div style={{ background: '#2a1810', padding: '12px', border: '1px solid #8b4513' }}>
              <div style={{ color: '#f87171', fontWeight: 'bold' }}>LIQUIDATED</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Liquidated on candle {lastRoundResult.liquidationCandleIndex + 1} - wick hit your liquidation price. You lost all your margin.
              </div>
              <div style={{ fontSize: '11px', marginTop: '8px', color: '#888' }}>
                What if you used 3x? Ghost replay: Much safer, likely survived with smaller gains.
              </div>
            </div>
          ) : (
            <div>PnL: <strong style={{ color: lastRoundResult.pnl >= 0 ? '#4ade80' : '#f87171' }}>{lastRoundResult.pnl >= 0 ? '+' : ''}${fmt(Math.abs(lastRoundResult.pnl))}</strong></div>
          )}
          {lastRoundResult.liquidated && (
            <div>PnL: <strong style={{ color: '#f87171' }}>-${fmt(lastRoundResult.balanceChange < 0 ? Math.abs(lastRoundResult.balanceChange) : (lastRoundResult.pnl >= 0 ? 0 : Math.abs(lastRoundResult.pnl)))}</strong></div>
          )}
          <div>Funding paid: <strong>${fmt(lastRoundResult.fundingPaid)}</strong></div>
          <div style={{ background: '#1a1a1a', padding: '10px', border: '1px solid #333', fontSize: '12px' }}>
            <strong>Lesson:</strong> {lastRoundResult.lesson}
            <div style={{ marginTop: '4px' }}>
              <Link href={'/learn/' + lastRoundResult.lessonId} className='g-learn'>
                Learn why →
              </Link>
            </div>
          </div>
          <button type='button' className='g-btn g-btn-primary g-btn-wide' onClick={nextRound}>
            {roundIndex < LIQUIDATION_CONFIG.rounds - 1 ? 'Next Round' : 'See Final Result'}
          </button>
        </section>
      )}

      {phase === 'final' && (
        <section className='g-panel g-graded'>
          <div className='g-grade-badge'>FINAL RESULT</div>
          <h2 className='g-rank'>{(RANK_TITLES.filter(r => balance >= r.minBalance).pop() || RANK_TITLES[0]).title}</h2>
          <p className='g-sub'>{(RANK_TITLES.filter(r => balance >= r.minBalance).pop() || RANK_TITLES[0]).blurb}</p>
          {totalAura > 0 && <p className='g-sub' style={{ fontSize: '12px' }}>· Total aura: <strong>{totalAura}</strong></p>}
          <div className='g-stats'>
            <div className='g-stat'>
              <span className='g-stat-num'>${fmt(balance)}</span>
              <span className='g-stat-label'>final balance</span>
            </div>
            <div className='g-stat'>
              <span className='g-stat-num'>{roundResults.filter(r => !r.liquidated).length}/{roundResults.length}</span>
              <span className='g-stat-label'>survived rounds</span>
            </div>
            <div className='g-stat'>
              <span className='g-stat-num'>{Math.max(0, Math.floor((balance - 1000) / 50))}</span>
              <span className='g-stat-label'>aura earned</span>
            </div>
          </div>
          <div className='g-btn-row'>
            <button type='button' className='g-btn g-btn-primary' onClick={handleShare}>
              <Share2 size={16} /> {shareCopied ? 'Copied!' : 'Share'}
            </button>
            <button type='button' className='g-btn' onClick={handleStart}>
              <RotateCcw size={16} /> Play again
            </button>
            <Link href='/games' className='g-btn'>
              <ArrowLeft size={16} /> Back to Arcade
            </Link>
          </div>
          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>Simulation. Not trading advice.</div>
        </section>
      )}

      {tutorialOpen && (
        <div className='g-tut-overlay' role='dialog' aria-modal='true' aria-label='How to play'>
          <div className='g-tut'>
            <h3 className='g-title'>How Liquidation Line works</h3>
            <ul className='g-tut-list'>
              <li>Start with $1,000 fake balance. Trade a fictional perp over 5 rounds.</li>
              <li>Choose Long/Short, leverage (1x-50x), and margin. Higher leverage = closer liquidation.</li>
              <li>Liquidation is triggered by candle wicks (high/low), not just close price.</li>
              <li>Funding is paid every few candles. Liquidated positions lose all margin.</li>
              <li>Watch for Whale Wanda and the Liquidator bot on big wicks.</li>
            </ul>
            <p className='g-tut-note'>Simulation only. Not trading advice.</p>
            <button type='button' className='g-btn g-btn-primary g-btn-wide' onClick={dismissTutorial}>
              Got it
            </button>
            <button type='button' className='g-tut-skip' onClick={dismissTutorial}>
              Skip tutorial
            </button>
          </div>
        </div>
      )}
    </main>
  );
}