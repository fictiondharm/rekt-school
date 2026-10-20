'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Character } from '@/components/games/Character';
import { addLocalAura } from '@/lib/progress';
import {
  RUG_CONFIG,
  INVESTOR_META,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  buildCrowd,
  takePerInvestor,
  roundScore,
  auraFor,
  rankFor,
  type InvestorDecision,
  type RoundResult,
  type RugSettings,
} from '@/lib/rugTycoon';
import { ArrowLeft, Coins, Rocket, Share2, RotateCcw, Check, X } from 'lucide-react';

type Phase = 'intro' | 'setup' | 'launching' | 'result' | 'graded';

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

function readNumber(key: string, fallback = 0): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? parseInt(raw, 10) || 0 : fallback;
  } catch {
    return fallback;
  }
}

export function RugTycoon() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [settings, setSettings] = useState<RugSettings>(DEFAULT_SETTINGS);
  const [crowd, setCrowd] = useState<InvestorDecision[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastResult, setLastResult] = useState<{ buyers: number; take: number; score: number } | null>(null);
  const [best, setBest] = useState(0);
  const [totalAura, setTotalAura] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const awardedRef = useRef(false);

  // Load saved values + first-play tutorial.
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

  const remaining = RUG_CONFIG.budget - settings.liquidity - settings.hype;
  const take = takePerInvestor(settings);

  /* ---------------- Launch + reveal animation ---------------- */
  useEffect(() => {
    if (phase !== 'launching') return;
    setRevealed(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= crowd.length) {
        window.clearInterval(id);
        window.setTimeout(() => setPhase('result'), 700);
      }
    }, RUG_CONFIG.revealMs);
    return () => window.clearInterval(id);
  }, [phase, crowd]);

  const buyersSoFar = useMemo(
    () => crowd.slice(0, revealed).filter((c) => c.buys).length,
    [crowd, revealed]
  );

  const handleStart = () => {
    awardedRef.current = false;
    setRound(0);
    setResults([]);
    setCrowd([]);
    setRevealed(0);
    setLastResult(null);
    setSettings(DEFAULT_SETTINGS);
    setPhase('setup');
  };

  const handleLaunch = () => {
    const built = buildCrowd(round, settings);
    setCrowd(built);
    setLastResult(null);
    setPhase('launching');
  };

  const finalize = useCallback((all: RoundResult[]) => {
    const total = all.reduce((sum, r) => sum + r.score, 0);
    const earned = auraFor(total);
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
    if (total > best) {
      setBest(total);
      try {
        window.localStorage.setItem(STORAGE_KEYS.best, String(total));
      } catch {
        /* ignore */
      }
    }
    setPhase('graded');
  }, [best]);

  const handleNext = () => {
    if (!lastResult) return;
    const entry: RoundResult = { round, ...lastResult };
    const newResults = [...results, entry];
    setResults(newResults);
    if (round < RUG_CONFIG.rounds - 1) {
      setRound(round + 1);
      setCrowd([]);
      setRevealed(0);
      setPhase('setup');
    } else {
      finalize(newResults);
    }
  };

  // Compute the current round result when the reveal finishes.
  useEffect(() => {
    if (phase !== 'result' || !crowd.length) return;
    const buyers = crowd.filter((c) => c.buys).length;
    setLastResult({
      buyers,
      take,
      score: roundScore(buyers, settings),
    });
  }, [phase, crowd, take, settings]);

  const handleShare = async () => {
    const bestRoundBuyers = results.length
      ? Math.max(...results.map((r) => r.buyers))
      : lastResult?.buyers ?? 0;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `I fooled ${bestRoundBuyers}/${RUG_CONFIG.crowdSize} investors in Rug Tycoon on Rekt School. Think you can rug harder? ${origin}/games/rug-tycoon`;
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

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const rank = rankFor(totalScore);

  /* ---------------- Render helpers ---------------- */

  const walkers = crowd.filter((c) => !c.buys);

  return (
    <main className="g-shell-content">
      <div className="g-topline">
        <Link href="/games" className="g-backlink">
          <ArrowLeft size={14} /> Back to Games
        </Link>
        <span className="g-round-chip">
          {phase === 'graded' ? 'Run complete' : `Round ${Math.min(round + 1, RUG_CONFIG.rounds)}/${RUG_CONFIG.rounds}`}
        </span>
      </div>

      {/* INTRO */}
      {phase === 'intro' && (
        <section className="g-panel">
          <div className="g-rugsy-row">
            <Character id="rugsy" mood="buy" size={96} title="Rugsy" />
            <div className="g-bubble">
              I am Rugsy, and this whole town is full of degens begging to be relieved of
              their SOL. Set up your token launch, trick as many of them as you can, and see
              how high you can run the score before they get wise.
            </div>
          </div>
          <div className="g-best-line">
            Best run: <strong>{best > 0 ? fmt(best) : 'no runs yet'}</strong>
            {totalAura > 0 && <> · Aura earned: <strong>{totalAura}</strong></>}
          </div>
          <button type="button" className="g-btn g-btn-primary g-btn-wide" onClick={handleStart}>
            <Rocket size={18} /> Start rugging
          </button>
        </section>
      )}

      {/* SETUP */}
      {phase === 'setup' && (
        <section className="g-panel">
          <h1 className="g-title">Launch pad</h1>
          <p className="g-sub">
            You have {fmt(RUG_CONFIG.budget)} to spend on liquidity and hype. Everything else
            is your own trickery.
          </p>

          <div className="g-budget" data-over={remaining < 0 ? 'true' : 'false'}>
            <Coins size={16} /> Remaining budget: <strong>{fmt(remaining)}</strong>
          </div>

          <label className="g-field">
            <span className="g-field-label">
              Your share of supply <b>{settings.supplyShare}%</b>
            </span>
            <input
              type="range"
              className="g-range"
              min={RUG_CONFIG.share.min}
              max={RUG_CONFIG.share.max}
              step={RUG_CONFIG.share.step}
              value={settings.supplyShare}
              onChange={(e) =>
                setSettings((s) => ({ ...s, supplyShare: Number(e.target.value) }))
              }
            />
            <span className="g-hint">A big bag boosts your take - but careful buyers notice.</span>
          </label>

          <label className="g-field">
            <span className="g-field-label">
              Liquidity <b>{fmt(settings.liquidity)}</b>
            </span>
            <input
              type="range"
              className="g-range"
              min={RUG_CONFIG.liquidity.min}
              max={RUG_CONFIG.liquidity.max}
              step={RUG_CONFIG.liquidity.step}
              value={settings.liquidity}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  liquidity: Math.min(Number(e.target.value), RUG_CONFIG.budget - s.hype),
                }))
              }
            />
            <span className="g-hint">Deep pools attract Whale Wanda. It costs real budget.</span>
          </label>

          <label className="g-field">
            <span className="g-field-label">
              Hype budget <b>{fmt(settings.hype)}</b>
            </span>
            <input
              type="range"
              className="g-range"
              min={RUG_CONFIG.hype.min}
              max={RUG_CONFIG.hype.max}
              step={RUG_CONFIG.hype.step}
              value={settings.hype}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  hype: Math.min(Number(e.target.value), RUG_CONFIG.budget - s.liquidity),
                }))
              }
            />
            <span className="g-hint">Manufactured FOMO. Fiona and Harry cannot resist it.</span>
          </label>

          <div className="g-toggle-row">
            <button
              type="button"
              className={`g-toggle ${settings.mintAuthority ? 'g-toggle-on' : 'g-toggle-off'}`}
              onClick={() => setSettings((s) => ({ ...s, mintAuthority: !s.mintAuthority }))}
            >
              {settings.mintAuthority ? <Check size={16} /> : <X size={16} />}
              Mint authority: {settings.mintAuthority ? 'kept' : 'revoked'}
            </button>
            <button
              type="button"
              className={`g-toggle ${settings.freezeAuthority ? 'g-toggle-on' : 'g-toggle-off'}`}
              onClick={() => setSettings((s) => ({ ...s, freezeAuthority: !s.freezeAuthority }))}
            >
              {settings.freezeAuthority ? <Check size={16} /> : <X size={16} />}
              Freeze authority: {settings.freezeAuthority ? 'kept' : 'revoked'}
            </button>
          </div>

          <div className="g-take-preview">
            Take per fooled investor: <strong>{fmt(take)}</strong>
          </div>

          <button
            type="button"
            className="g-btn g-btn-primary g-btn-wide"
            onClick={handleLaunch}
            disabled={remaining < 0}
          >
            <Rocket size={18} /> Launch
          </button>
        </section>
      )}

      {/* LAUNCHING + RESULT crowd */}
      {(phase === 'launching' || phase === 'result') && (
        <section className="g-panel">
          <div className="g-live-bar">
            <span>
              Buyers: <strong>{buyersSoFar}</strong> / {crowd.length}
            </span>
            {phase === 'launching' && <span className="g-muted">deciding…</span>}
            {phase === 'result' && <span className="g-muted">settled</span>}
          </div>

          <div className="g-crowd">
            {crowd.map((c, idx) => {
              const decided = phase === 'result' || idx < revealed;
              return (
                <div key={c.id} className="g-crowd-cell">
                  <Character
                    id={c.type}
                    mood={decided ? (c.buys ? 'buy' : 'walk') : 'walk'}
                    dim={!decided}
                    size={64}
                    title={INVESTOR_META[c.type].name}
                  />
                  <span className={`g-crowd-name ${decided ? (c.buys ? 'is-buy' : 'is-walk') : ''}`}>
                    {decided ? (c.buys ? 'Buy' : 'Walk') : '…'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* RESULT detail */}
      {phase === 'result' && lastResult && (
        <section className="g-panel">
          <h2 className="g-title">Round {round + 1} result</h2>
          <div className="g-stats">
            <div className="g-stat">
              <span className="g-stat-num">{lastResult.buyers}/{RUG_CONFIG.crowdSize}</span>
              <span className="g-stat-label">investors fooled</span>
            </div>
            <div className="g-stat">
              <span className="g-stat-num">{fmt(lastResult.score)}</span>
              <span className="g-stat-label">you extracted</span>
            </div>
            <div className="g-stat">
              <span className="g-stat-num">{RUG_CONFIG.crowdSize - lastResult.buyers}</span>
              <span className="g-stat-label">walked away</span>
            </div>
          </div>

          {walkers.length > 0 && (
            <div className="g-walkers">
              <h3 className="g-subhead">Who walked away, and why</h3>
              {walkers.map((w) => (
                <div key={w.id} className="g-walker">
                  <Character
                    id={w.type}
                    mood="walk"
                    size={40}
                    title={INVESTOR_META[w.type].name}
                  />
                  <div className="g-walker-body">
                    <span className="g-walker-name">{INVESTOR_META[w.type].name}</span>
                    <span className="g-walker-reason">“{w.reason}”</span>
                    <Link href={`/learn/${w.lessonId}`} className="g-learn">
                      Learn why →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="g-btn g-btn-primary g-btn-wide" onClick={handleNext}>
            {round < RUG_CONFIG.rounds - 1 ? `Next round (${round + 2}/${RUG_CONFIG.rounds})` : 'See final grade'}
          </button>
        </section>
      )}

      {/* GRADED */}
      {phase === 'graded' && (
        <section className="g-panel g-graded">
          <div className="g-grade-badge">FINAL GRADE</div>
          <h2 className="g-rank">{rank.title}</h2>
          <p className="g-sub">{rank.blurb}</p>

          <div className="g-stats">
            <div className="g-stat">
              <span className="g-stat-num">{fmt(totalScore)}</span>
              <span className="g-stat-label">total score</span>
            </div>
            <div className="g-stat">
              <span className="g-stat-num">{auraFor(totalScore)}</span>
              <span className="g-stat-label">aura earned</span>
            </div>
            <div className="g-stat">
              <span className="g-stat-num">{fmt(best)}</span>
              <span className="g-stat-label">best run</span>
            </div>
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
            <h3 className="g-title">How Rug Tycoon works</h3>
            <ul className="g-tut-list">
              <li>Spend a fake $10,000 on liquidity and hype, and decide how much supply you keep.</li>
              <li>Keeping mint or freeze authority raises your take per fooled investor - but scares the careful ones away.</li>
              <li>20 investors decide one by one. Fool more of them for a higher score across 3 rounds.</li>
            </ul>
            <p className="g-tut-note">Every walk-away reason links to the real lesson that explains it.</p>
            <button type="button" className="g-btn g-btn-primary g-btn-wide" onClick={dismissTutorial}>
              Got it, let me rug
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
