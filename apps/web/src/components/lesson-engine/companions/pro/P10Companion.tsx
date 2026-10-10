'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { RotateCcw, ShieldCheck, ShieldAlert, AlertTriangle, Flag } from 'lucide-react';

interface FlagDef {
  id: string;
  label: string;
  detail: string;
  weight: number;
  fatal?: boolean;
}

const FLAGS: FlagDef[] = [
  { id: 'mint', label: 'Mint authority not revoked', detail: 'Team can print unlimited supply and dilute you.', weight: 25, fatal: true },
  { id: 'pause', label: 'Pause / freeze / blacklist functions', detail: 'Exit can be blocked - a honeypot switch.', weight: 20 },
  { id: 'eoa', label: 'Upgradeable by a single EOA key', detail: 'One key can swap in a drain contract.', weight: 30, fatal: true },
  { id: 'timelock', label: 'No timelock on upgrades or withdraws', detail: 'Instant drain if a key falls.', weight: 15 },
  { id: 'anon', label: 'Anonymous team with admin powers', detail: 'No accountability if they drain.', weight: 10 },
  { id: 'audit', label: 'No audit, or audit older than the code', detail: 'Unknown bug classes unexamined.', weight: 15 },
  { id: 'tvl', label: 'TVL dominated by one depositor', detail: 'A single exit craters the protocol.', weight: 10 },
  { id: 'oracle', label: 'Oracle from a single thin pool', detail: 'Manipulable price = manipulable protocol.', weight: 25, fatal: true },
];

export function P10Companion() {
  const [active, setActive] = useState<Record<string, boolean>>({
    pause: true,
    timelock: true,
  });

  const handleReset = () => setActive({ pause: true, timelock: true });
  const toggle = (id: string) => setActive((a) => ({ ...a, [id]: !a[id] }));

  const present = FLAGS.filter((f) => active[f.id]);
  const hasFatal = present.some((f) => f.fatal);
  const deduction = present.reduce((sum, f) => sum + f.weight, 0);
  let score = Math.max(0, 100 - deduction);
  if (hasFatal) score = Math.min(score, 30); // one fatal flaw caps the whole score

  const rating =
    score >= 80 ? { label: 'LOOKS SOLID', variant: 'accent' as const }
    : score >= 55 ? { label: 'PROCEED WITH CAUTION', variant: 'warn' as const }
    : { label: 'DO NOT DEPOSIT', variant: 'danger' as const };

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB P10 &bull; RED FLAG AUDIT
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <h3 className="font-heading font-semibold text-xl text-ink">Trust Surface Checklist</h3>
        <p className="text-xs text-ink-soft">
          Toggle each red flag you find. One fatal flaw caps the entire protocol.
        </p>
      </div>

      <Card className="p-6 space-y-4 bg-surface border border-border shadow-sm">
        <div className="p-4 rounded-xl bg-bg border border-border space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold text-sm text-ink flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-accent" /> Safety Score
            </span>
            <span className={`font-mono font-semibold text-3xl ${score >= 80 ? 'text-emerald-600' : score >= 55 ? 'text-amber-600' : 'text-red-600'}`}>
              {score}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-border/60 overflow-hidden">
            <div
              className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <Badge variant={rating.variant} className="text-[10px]">
              {rating.label}
            </Badge>
            {hasFatal && (
              <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Fatal flaw capped score at 30
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {FLAGS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => toggle(f.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-start gap-2.5 ${
                active[f.id] ? 'bg-red-50 border-red-300' : 'bg-bg border-border hover:border-ink/30'
              }`}
            >
              <span
                className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  active[f.id] ? 'bg-red-500 border-red-500 text-white' : 'border-ink/30 text-transparent'
                }`}
              >
                ✓
              </span>
              <span className="space-y-0.5">
                <span className="block text-xs font-semibold text-ink">
                  {f.label}
                  {f.fatal && <span className="ml-1.5 text-[9px] text-red-600 font-bold uppercase">Fatal</span>}
                </span>
                <span className="block text-[11px] text-ink-soft">{f.detail}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3">
        {score >= 80 ? (
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
          <p className="text-ink-soft leading-relaxed">
            {present.length === 0
              ? 'No red flags ticked: mint authority revoked, no pause/freeze, upgrades behind a timelocked multisig, audited, and an independent oracle. This is the shape of a protocol whose trust surface you can actually reason about - rare, but it exists.'
              : hasFatal
              ? `You ticked a FATAL flaw (a lone upgrade key, a mint authority, or a manipulable oracle). That single lever can take all the money, so the score is capped at 30 no matter how good everything else looks. This is exactly how real protocols die - not from an average of small issues, but from one unguarded lever.`
              : `${present.length} red flag${present.length > 1 ? 's' : ''} ticked for a ${deduction}-point deduction, landing at ${score}/100. No single fatal flaw, but the accumulated trust surface is real. Ask whether you can live with each lever, or size so small it would not matter.`}
          </p>
        </div>
      </Card>
    </div>
  );
}
