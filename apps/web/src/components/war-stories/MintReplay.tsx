'use client';

import React, { useState } from 'react';
import { CaseMintReplay } from '@defi-mommy/content-schema';
import { Card, Button, Badge } from '@/components/ui';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Coins,
  ArrowRightLeft,
  RotateCcw,
  Skull,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

const usd = (n: number, digits = 0) =>
  '$' + n.toLocaleString(undefined, { maximumFractionDigits: digits });

const compact = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toLocaleString();
};

export function MintReplay({
  replay,
  protocol,
}: {
  replay: CaseMintReplay;
  protocol: string;
}) {
  const [stage, setStage] = useState(0);
  const [patched, setPatched] = useState(false);
  const [forged, setForged] = useState(false);
  const [passed, setPassed] = useState(false);
  const [minted, setMinted] = useState(false);
  const [drained, setDrained] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const pushLog = (line: string) => setLog((l) => [...l, line]);

  const reset = () => {
    setStage(0);
    setPatched(false);
    setForged(false);
    setPassed(false);
    setMinted(false);
    setDrained(false);
    setFailed(null);
    setLog([]);
  };

  const stages = [
    'Recon',
    'Read the validator',
    'Forge collateral',
    'Walk it through',
    'Mint',
    'Drain & bridge',
  ];
  const STAGE_ICONS = [Search, ShieldAlert, Coins, ShieldAlert, Coins, ArrowRightLeft];

  return (
    <Card className="p-5 sm:p-6 space-y-5 border-2 border-ink rounded-xl shadow-pop bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="danger" className="gap-1.5">
            <Skull className="w-3.5 h-3.5" /> REPLAY THE EXPLOIT
          </Badge>
          <h3 className="font-heading font-bold text-lg leading-snug">
            Print {compact(replay.mintAmount)} {replay.token} from a fake receipt
          </h3>
          <p className="text-xs text-ink-soft leading-relaxed max-w-xl">
            {protocol} should only mint 1 {replay.token} for every real dollar of backing. It minted
            instead because its {replay.checkCount} validation checks only compared accounts you
            supplied to each other - so a forged chain passed them all. Toggle the one-line fix, then
            print {compact(replay.mintAmount)} {replay.token} from nothing. 100% simulated.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-xs shrink-0">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {stages.map((s, i) => {
          const Icon = STAGE_ICONS[i];
          const done = i < stage;
          const cur = i === stage;
          return (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                  cur ? 'bg-accent text-white' : done ? 'bg-accent/15 text-accent' : 'bg-bg text-ink-faint'
                }`}
              >
                {done ? <CheckCircle2 className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < stages.length - 1 && <span className="text-ink-faint text-[10px]">→</span>}
            </React.Fragment>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-bg border border-border space-y-3">
        {stage === 0 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              A stablecoin like {protocol} keeps its $1 peg the old-fashioned way: you deposit real
              value, it prints the coin against it. Here the deposit is a Saber USD LP token - a token
              that already represents $1 of USDC + USDT earning interest. Deposit one, get one{" "}
              {replay.token}. The whole machine trusts one thing: that you really did hand over the
              collateral. An auditor&apos;s job is to ask: <em>how does the program prove that?</em>
            </p>
            <Button variant="primary" className="gap-2" onClick={() => setStage(1)}>
              <Search className="w-4 h-4" /> Study print_cash()
            </Button>
          </>
        )}

        {stage === 1 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              The mint function runs {replay.checkCount} checks before printing. Here is the
              suspicious part: every single check compares two accounts <em>that you, the caller,
              supplied</em>. Nothing is ever compared to a trusted root - like the real{" "}
              {replay.token} mint. Pick a build:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPatched(false)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  !patched ? 'bg-red-50 border-red-400' : 'bg-surface border-border'
                }`}
              >
                <div className="font-mono font-bold text-red-700">as shipped (unaudited)</div>
                <div className="text-ink-soft mt-1">
                  {replay.checkCount} checks, all caller-to-caller. No anchor to the real{" "}
                  {replay.token} mint.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPatched(true)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  patched ? 'bg-emerald-50 border-emerald-400' : 'bg-surface border-border'
                }`}
              >
                <div className="font-mono font-bold text-emerald-700">{replay.missingCheck}</div>
                <div className="text-ink-soft mt-1">
                  One added line: the collateral&apos;s backing mint must BE {replay.token}.
                </div>
              </button>
            </div>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                pushLog(`> build: ${patched ? replay.missingCheck : 'as shipped'}`);
                setStage(2);
              }}
            >
              Use this build
            </Button>
          </>
        )}

        {stage === 2 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              The program &quot;accepts&quot; whatever LP token you say is backing. So create your own
              mint - {replay.token}0, or any name - and print{" "}
              {replay.collateralTokens.toLocaleString()} of your worthless tokens. You are the mint
              authority, so this is free.
            </p>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                pushLog(`+ created fake LP mint; minted ${replay.collateralTokens.toLocaleString()} worthless tokens to self`);
                setForged(true);
                setStage(3);
              }}
            >
              <Coins className="w-4 h-4" /> Forge {replay.collateralTokens.toLocaleString()} LP tokens
            </Button>
          </>
        )}

        {stage === 3 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              Now build the account chain: your fake bank, your fake LP token as the
              &quot;collateral,&quot; and a fake Saber swap to show the deposit went through. Each of
              the {replay.checkCount} checks compares these accounts to each other. Since you made
              them all, they all match.
            </p>
            {failed && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{failed}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <div className="text-ink-faint text-[10px] uppercase tracking-wide">Check 1 of {replay.checkCount}</div>
                <div className="font-mono font-bold mt-0.5">assert_keys_eq!(bank, bank)</div>
                <div className="text-[10px] text-ink-soft mt-0.5">supplied {replay.token} mint vs your fake - both yours</div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <div className="text-ink-faint text-[10px] uppercase tracking-wide">Check {replay.checkCount} of {replay.checkCount}</div>
                <div className="font-mono font-bold mt-0.5">assert_keys_eq!(swap, pool)</div>
                <div className="text-[10px] text-ink-soft mt-0.5">your fake swap vs your fake pool - both yours</div>
              </div>
            </div>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                pushLog(`> submitted 9 accounts: bank, collateral, swap, pool, vault... all attacker-controlled`);
                if (patched) {
                  pushLog(`xx REJECTED: ${replay.missingCheck} - backing mint is not CASH`);
                  setFailed(
                    `Blocked. The patched build checked the collateral's backing mint against the ONE thing it's supposed to honor - the real ${replay.token} mint - and yours is a forgery. The attack dies on line one.`
                  );
                  return;
                }
                pushLog(`!! checks 1-${replay.checkCount}: passed (each compared two accounts you supplied)`);
                setFailed(null);
                setPassed(true);
                setStage(4);
              }}
            >
              <ShieldAlert className="w-4 h-4" /> Submit the forged chain
            </Button>
            {patched && (
              <button
                type="button"
                onClick={() => {
                  setPatched(false);
                  setFailed(null);
                }}
                className="text-[11px] font-bold text-accent hover:underline"
              >
                ← switch back to the unaudited build
              </button>
            )}
          </>
        )}

        {stage === 4 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              All {replay.checkCount} checks passed. The program believes you deposited $
              {replay.collateralTokens.toLocaleString()} of backing. Print the same amount of {replay.token}{' '}
              - into thin air.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <div className="text-ink-faint text-[10px] uppercase tracking-wide">Mint</div>
                <div className="font-mono font-bold text-danger">
                  {replay.mintAmount.toLocaleString()} {replay.token}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <div className="text-ink-faint text-[10px] uppercase tracking-wide">Collateral behind it</div>
                <div className="font-mono font-bold">
                  {compact(replay.collateralTokens)} worthless LP
                </div>
              </div>
            </div>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                pushLog(`<< MINTED ${replay.mintAmount.toLocaleString()} ${replay.token} against fake collateral`);
                setMinted(true);
                setStage(5);
              }}
            >
              <Coins className="w-4 h-4" /> Print {compact(replay.mintAmount)} {replay.token}
            </Button>
          </>
        )}

        {stage === 5 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              The {replay.token} is trusted by every Saber pool - it looks exactly like real money.
              Trade it for USDC, USDT and UST, then send the proceeds to Ethereum through Wormhole. No
              one notices until the peg is gone.
            </p>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                pushLog(`> swapped CASH -> USDC/USDT/UST ≈ ${usd(replay.exitedUsd)}`);
                pushLog(`> moved proceeds off Solana: ${replay.bridgeNote}`);
                setDrained(true);
                setStage(6);
              }}
            >
              <ArrowRightLeft className="w-4 h-4" /> Swap &amp; bridge it out
            </Button>
          </>
        )}

        {stage === 6 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-danger">
              <Skull className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm">
                  Drained: ~{usd(replay.exitedUsd)} USD
                </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  You printed {replay.mintAmount.toLocaleString()} {replay.token} against a receipt
                  you wrote yourself and walked out with ~{usd(replay.exitedUsd)} of the protocol&apos;s
                  real backing. The peg did the rest: {replay.token} collapsed from ${replay.priceBefore.toLocaleString()} to ~$
                  {replay.priceAfter.toLocaleString()} and {protocol}&apos;s TVL fell from ~$
                  {(replay.tvlBefore / 1_000_000).toFixed(1)}M to ~$
                  {(replay.tvlAfter / 1_000).toFixed(1)}k. No key was stolen - the program just verified
                  the wrong thing. The fix was adding one line that anchors the collateral to the real{" "}
                  {replay.token} mint. Trusting accounts that compare only to each other is trusting
                  nothing.
                </p>
              </div>
            </div>
            <Button variant="secondary" className="gap-2" onClick={reset}>
              <RotateCcw className="w-4 h-4" /> Run it again
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <Stat label="Build" value={patched ? 'patched' : 'vulnerable'} danger={!patched} />
        <Stat label="Collateral" value={forged ? 'forged' : '—'} danger={forged} />
        <Stat label="Minted" value={minted ? `${compact(replay.mintAmount)} ${replay.token}` : '—'} danger={minted} />
        <Stat label="Extracted" value={drained ? `~${usd(replay.exitedUsd)}` : '—'} danger={drained} />
      </div>

      {log.length > 0 && (
        <div className="p-3 rounded-xl bg-ink text-emerald-300 font-mono text-[10px] leading-relaxed max-h-40 overflow-y-auto space-y-0.5">
          <div className="flex items-center gap-1.5 text-ink-faint mb-1">
            <Terminal className="w-3 h-3" /> simulated log (no real chain)
          </div>
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Stat({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="p-2.5 rounded-lg bg-bg border border-border space-y-0.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">{label}</div>
      <div className={`text-xs font-semibold truncate ${danger ? 'text-danger' : 'text-ink'}`}>
        {value}
      </div>
    </div>
  );
}