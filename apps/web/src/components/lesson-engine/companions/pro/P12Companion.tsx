'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { RotateCcw, Trophy, ExternalLink, AlertTriangle, Hammer } from 'lucide-react';

type Oracle = 'spot' | 'multi' | 'twap';
type Liquidity = 'full' | 'narrow' | 'launchpad';
type Upgrade = 'eoa' | 'multisig' | 'timelocked';
type Incentives = 'ponzi' | 'sustainable';

export function P12Companion() {
  const [oracle, setOracle] = useState<Oracle>('spot');
  const [liquidity, setLiquidity] = useState<Liquidity>('full');
  const [leverage, setLeverage] = useState(20);
  const [upgrade, setUpgrade] = useState<Upgrade>('eoa');
  const [incentives, setIncentives] = useState<Incentives>('ponzi');

  const handleReset = () => {
    setOracle('spot');
    setLiquidity('full');
    setLeverage(20);
    setUpgrade('eoa');
    setIncentives('ponzi');
  };

  const oracleScore = oracle === 'twap' ? 10 : oracle === 'multi' ? 7 : 2;
  const liqScore = liquidity === 'full' ? 7 : liquidity === 'narrow' ? 5 : 4;
  const levScore = leverage <= 5 ? 10 : leverage <= 10 ? 7 : leverage <= 20 ? 4 : 1;
  const upScore = upgrade === 'timelocked' ? 10 : upgrade === 'multisig' ? 6 : 1;
  const incScore = incentives === 'sustainable' ? 9 : 2;

  const dims = [
    { name: 'Oracle Safety', score: oracleScore },
    { name: 'Liquidity Design', score: liqScore },
    { name: 'Leverage Discipline', score: levScore },
    { name: 'Security Posture', score: upScore },
    { name: 'Economics', score: incScore },
  ];
  const raw = (oracleScore + liqScore + levScore + upScore + incScore) * 2; // 0-100
  const fatalOracleLev = oracle === 'spot' && leverage > 10;
  const fatalUpgrade = upgrade === 'eoa';
  const fatal = fatalOracleLev || fatalUpgrade;
  const score = fatal ? Math.min(raw, 30) : raw;

  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

  const Seg = ({ options, value, onChange }: { options: { v: string; label: string }[]; value: string; onChange: (v: any) => void }) => (
    <div className="grid gap-2 text-[11px]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`p-2 rounded-lg border transition-all ${
            value === o.v ? 'bg-accent/10 border-accent text-accent font-semibold' : 'bg-bg border-border text-ink-soft hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1" data-tour="p12-head">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            CAPSTONE P12 &bull; PROTOCOL ARCHITECT
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Design Your Protocol</h3>
        <p className="text-xs text-ink-soft">
          Set every dial from the Pro tier, then stress-test the result.
        </p>
      </div>

      <Card data-tour="p12-lab" className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">1. Price Source (P5)</span>
          <Seg
            options={[{ v: 'spot', label: 'Single-pool spot' }, { v: 'multi', label: 'Multi-source' }, { v: 'twap', label: 'TWAP' }]}
            value={oracle}
            onChange={setOracle}
          />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">2. Liquidity Model (P7, P9)</span>
          <Seg
            options={[{ v: 'full', label: 'Full-range AMM' }, { v: 'narrow', label: 'Concentrated' }, { v: 'launchpad', label: 'Bonding curve' }]}
            value={liquidity}
            onChange={setLiquidity}
          />
        </div>

        <Slider
          label="3. Max Leverage (P3, P11)"
          value={leverage}
          min={1}
          max={100}
          step={1}
          formatValue={(v) => `${v}×`}
          onChange={setLeverage}
        />

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">4. Upgrade Authority (P10)</span>
          <Seg
            options={[{ v: 'eoa', label: 'Single EOA' }, { v: 'multisig', label: 'Multisig' }, { v: 'timelocked', label: 'Timelocked' }]}
            value={upgrade}
            onChange={setUpgrade}
          />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">5. Incentives (P11)</span>
          <Seg
            options={[{ v: 'ponzi', label: 'Emission ponzi' }, { v: 'sustainable', label: 'Sustainable' }]}
            value={incentives}
            onChange={setIncentives}
          />
        </div>

        {/* Score breakdown */}
        <div className="space-y-2">
          {dims.map((d) => (
            <div key={d.name} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-ink-soft">{d.name}</span>
                <span className="font-mono font-semibold text-ink">{d.score}/10</span>
              </div>
              <div className="h-2 rounded-full bg-border/60 overflow-hidden">
                <div
                  className={`h-full ${d.score >= 7 ? 'bg-emerald-500' : d.score >= 4 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${d.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={`p-4 rounded-xl border-2 space-y-2 ${fatal ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'}`}>
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Protocol Score
            </span>
            <span className={`font-mono font-semibold text-3xl ${fatal ? 'text-red-600' : 'text-emerald-600'}`}>
              {score} <span className="text-lg">({grade})</span>
            </span>
          </div>
          {fatal && (
            <p className="text-[11px] text-red-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Fatal flaw: {fatalOracleLev ? 'a manipulable oracle combined with >10× leverage ' : ''}
              {fatalUpgrade ? 'an unbounded single-key upgrade path ' : ''}
              caps your score at 30 regardless of the rest.
            </p>
          )}
        </div>

        <a
          href="https://solscan.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[11px] text-accent hover:underline"
        >
          This is a simulation - you can explore deploying on-chain here <ExternalLink className="w-3 h-3" />
        </a>
      </Card>

      <Card data-tour="p12-explainer" className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {fatal ? (
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        ) : (
          <Hammer className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {fatal
              ? `Your architecture has a single unguarded lever that can take all the money. A spot oracle with ${leverage}× leverage lets an attacker nudge price past thin liquidation lines for a mass cascade; an EOA upgrade key lets one compromised wallet swap in a drain contract. Real protocols do not die of their average decision - they die of their weakest link. Fix the fatal lever first.`
              : score >= 85
              ? `Congratulations - a self-consistent protocol: a robust oracle, sane leverage, timelocked upgrades, and sustainable incentives. No single lever can drain it, and the assumed attacker from P5-P11 has no profitable path. This is what "architect" actually means: not cleverness, but conservative defaults that survive a broken assumption.`
              : `No fatal flaw, but ${dims.filter((d) => d.score < 7).map((d) => d.name).join(', ')} still leave room to be pushed. There is no universally right answer - only trade-offs you can name. Tighten the weakest dimension and watch the score respond.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
