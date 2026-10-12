'use client';

import React, { useState } from 'react';
import { CaseBridgeReplay } from '@defi-mommy/content-schema';
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

export function BridgeReplay({
  replay,
  protocol,
}: {
  replay: CaseBridgeReplay;
  protocol: string;
}) {
  const [stage, setStage] = useState(0);
  const [patched, setPatched] = useState(false);
  const [fakeSysvar, setFakeSysvar] = useState(false);
  const [minted, setMinted] = useState(false);
  const [bridged, setBridged] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const pushLog = (line: string) => setLog((l) => [...l, line]);

  const valueUsd = replay.amount * replay.pricePerToken;
  const bridgedUsd = replay.bridgedOut * replay.pricePerToken;

  const reset = () => {
    setStage(0);
    setPatched(false);
    setFakeSysvar(false);
    setMinted(false);
    setBridged(false);
    setFailed(null);
    setLog([]);
  };

  const stages = [
    'Recon',
    'Read the code',
    'Decoy deposit',
    'Forge a VAA',
    'Mint',
    'Bridge out',
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
            Forge a guardian signature on {protocol}
          </h3>
          <p className="text-xs text-ink-soft leading-relaxed max-w-xl">
            A bridge should require {replay.requiredSigs}-of-{replay.guardians} guardian
            signatures before it mints. Break that check by lying about the one account it
            trusted - then toggle the patch that fixed it. 100% simulated.
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
              A bridge mints wrapped tokens on chain B only when it trusts a message saying
              "the asset really was locked on chain A". {protocol} trusts{' '}
              {replay.guardians} guardians and requires {replay.requiredSigs} signatures. The
              expensive curve math happens in a separate instruction - the bridge just reads
              the result.
            </p>
            <Button variant="primary" className="gap-2" onClick={() => setStage(1)}>
              <Search className="w-4 h-4" /> Study verify_signatures()
            </Button>
          </>
        )}

        {stage === 1 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              Here is how it looks up the earlier instruction's result. The vulnerable build
              trusts the account it was handed, by address. The patched build checks who owns
              it first. Pick a build:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPatched(false)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  !patched ? 'bg-red-50 border-red-400' : 'bg-surface border-border'
                }`}
              >
                <div className="font-mono font-bold text-red-700">{replay.vulnerableFn}</div>
                <div className="text-ink-soft mt-1">Unchecked - trusts the account as given.</div>
              </button>
              <button
                type="button"
                onClick={() => setPatched(true)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  patched ? 'bg-emerald-50 border-emerald-400' : 'bg-surface border-border'
                }`}
              >
                <div className="font-mono font-bold text-emerald-700">{replay.fixedFn}</div>
                <div className="text-ink-soft mt-1">Checked - verifies the account's owner.</div>
              </button>
            </div>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                pushLog(`> build: ${patched ? replay.fixedFn : replay.vulnerableFn}`);
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
              First, look legitimate: deposit a tiny real amount ({replay.decoy} ETH) so the
              activity blends in before the main event.
            </p>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                pushLog(`+ decoy deposit: ${replay.decoy} ETH locked (looks normal)`);
                setStage(3);
              }}
            >
              <Coins className="w-4 h-4" /> Make the decoy deposit
            </Button>
          </>
        )}

        {stage === 3 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              Now the trick. The bridge reads the verification result from the "instructions"
              sysvar. A real transaction gets the genuine system-owned sysvar. But you control
              your own transaction - so you can pass <em>your own</em> account that pretends to
              be the sysvar, containing a fake "signatures verified" instruction.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFakeSysvar(false)}
                className={`p-3 rounded-lg border text-left ${
                  !fakeSysvar ? 'bg-surface border-ink' : 'bg-surface border-border'
                }`}
              >
                <div className="font-semibold">Real sysvar</div>
                <div className="text-ink-soft mt-1">
                  Genuine - shows no guardian signatures were verified.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFakeSysvar(true)}
                className={`p-3 rounded-lg border text-left ${
                  fakeSysvar ? 'bg-red-50 border-red-400' : 'bg-surface border-border'
                }`}
              >
                <div className="font-semibold text-red-700">Attacker-controlled account</div>
                <div className="text-ink-soft mt-1">
                  Contains a forged "valid" instruction you wrote.
                </div>
              </button>
            </div>
            {failed && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{failed}</span>
              </div>
            )}
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                pushLog(`> submit VAA claiming ${replay.amount.toLocaleString()} ETH deposited`);
                if (patched) {
                  pushLog(`xx REJECTED: ${replay.fixedFn} - sysvar owner is not the System Program`);
                  setFailed(
                    `Blocked. The patched build checked the account's owner, saw it was not the System Program, and refused to trust the forged signatures. This is the one-line fix that ended the attack.`
                  );
                  return;
                }
                if (!fakeSysvar) {
                  pushLog(`xx REJECTED: real sysvar shows 0 valid guardian signatures`);
                  setFailed(
                    `Rejected. With the genuine sysvar, the bridge sees that no guardian actually signed - 0 of ${replay.requiredSigs} - so the mint is refused. You must spoof the sysvar to pass.`
                  );
                  return;
                }
                pushLog(`!! verify_signatures read the forged sysvar - signatures accepted`);
                setFailed(null);
                setMinted(true);
                setStage(4);
              }}
            >
              <ShieldAlert className="w-4 h-4" /> Submit the forged VAA
            </Button>
          </>
        )}

        {stage === 4 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              The bridge believed {replay.requiredSigs} guardians approved a{" "}
              {replay.amount.toLocaleString()}-ETH deposit. Mint the wrapped claim - against ETH
              that was never locked.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <div className="text-ink-faint text-[10px] uppercase tracking-wide">Mint</div>
                <div className="font-mono font-bold text-danger">
                  {replay.amount.toLocaleString()} {replay.token}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <div className="text-ink-faint text-[10px] uppercase tracking-wide">Value</div>
                <div className="font-mono font-bold">{usd(valueUsd)}</div>
              </div>
            </div>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                pushLog(`<< MINTED ${replay.amount.toLocaleString()} ${replay.token} (${usd(valueUsd)})`);
                setStage(5);
              }}
            >
              <Coins className="w-4 h-4" /> Mint the {replay.token}
            </Button>
          </>
        )}

        {stage === 5 && (
          <>
            <p className="text-sm text-ink-soft leading-relaxed">
              The minted {replay.token} looks like any other. Exit through the bridge's normal
              path - send it back to Ethereum and take real ETH from the reserves.
            </p>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                pushLog(`> bridged ${replay.bridgedOut.toLocaleString()} ETH out to Ethereum (${usd(bridgedUsd)})`);
                setBridged(true);
                setStage(6);
              }}
            >
              <ArrowRightLeft className="w-4 h-4" /> Bridge it out
            </Button>
          </>
        )}

        {stage === 6 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-danger">
              <Skull className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm">
                  Drained: {usd(bridgedUsd)} in real ETH
                </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  You minted {replay.amount.toLocaleString()} {replay.token} from nothing and walked
                  out with roughly {replay.bridgedOut.toLocaleString()} ETH ({usd(bridgedUsd)}) of
                  the bridge's real reserves. No guardian key was ever stolen - the program simply
                  verified the wrong thing. The fix was one word: use the <em>checked</em> sysvar
                  loader. Verifying the wrong statement is as bad as not verifying at all.
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
        <Stat label="Sysvar" value={stage >= 3 ? (fakeSysvar ? 'forged' : 'real') : '—'} danger={fakeSysvar} />
        <Stat label="Minted" value={minted ? `${(replay.amount / 1000).toFixed(0)}k ${replay.token}` : '—'} danger={minted} />
        <Stat label="Extracted" value={bridged ? usd(bridgedUsd) : '—'} danger={bridged} />
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
