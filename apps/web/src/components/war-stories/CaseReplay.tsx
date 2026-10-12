'use client';

import React, { useState, useMemo } from 'react';
import { CaseReplay as CaseReplayConfig } from '@defi-mommy/content-schema';
import { Card, Button, Badge, Slider } from '@/components/ui';
import {
  Wallet,
  Droplets,
  Scale,
  Flame,
  HandCoins,
  TrendingDown,
  RotateCcw,
  Skull,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58(bytes: Uint8Array): string {
  const digits: number[] = [0];
  for (const b of bytes) {
    let carry = b;
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] * 256;
      digits[i] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = '';
  for (const b of bytes) {
    if (b === 0) out += B58[0];
    else break;
  }
  for (let i = digits.length - 1; i >= 0; i--) out += B58[digits[i]];
  return out;
}

function fakeAddress(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return base58(bytes);
}

const usd = (n: number, digits = 0) =>
  '$' + n.toLocaleString(undefined, { maximumFractionDigits: digits });

const STAGE_ICONS = [Wallet, Droplets, Scale, Flame, HandCoins, TrendingDown];

export function CaseReplay({ replay, protocol }: { replay: CaseReplayConfig; protocol: string }) {
  const [stage, setStage] = useState(0);
  const [walletA, setWalletA] = useState<string | null>(null);
  const [walletB, setWalletB] = useState<string | null>(null);
  const [seed, setSeed] = useState(replay.seed);
  const [buy, setBuy] = useState(0);
  const [positionOpen, setPositionOpen] = useState(false);
  const [pumped, setPumped] = useState(false);
  const [exploited, setExploited] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const pushLog = (line: string) => setLog((l) => [...l, line]);

  const oraclePrice = useMemo(() => {
    if (!pumped) return replay.basePrice;
    const mult = (1 + buy / replay.thinDepth) ** 2;
    return Math.min(replay.peakPrice, replay.basePrice * mult);
  }, [pumped, buy, replay]);

  const previewPrice = useMemo(() => {
    const mult = (1 + buy / replay.thinDepth) ** 2;
    return Math.min(replay.peakPrice, replay.basePrice * mult);
  }, [buy, replay]);

  const inflatedProfit = replay.position * (oraclePrice - replay.entryPrice);
  const extractable = Math.min(replay.availableAssets, Math.max(0, inflatedProfit));
  const withdrawn = exploited ? extractable : 0;

  const reset = () => {
    setStage(0);
    setWalletA(null);
    setWalletB(null);
    setSeed(replay.seed);
    setBuy(0);
    setPositionOpen(false);
    setPumped(false);
    setExploited(false);
    setCollapsed(false);
    setLog([]);
  };

  const stages = [
    'Spin up wallets',
    'Fund the accounts',
    'Wash trade',
    'Feed the oracle',
    'Borrow & extract',
    'Pull the rug',
  ];

  return (
    <Card className="p-5 sm:p-6 space-y-5 border-2 border-ink rounded-xl shadow-pop bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="danger" className="gap-1.5">
            <Skull className="w-3.5 h-3.5" /> REPLAY THE EXPLOIT
          </Badge>
          <h3 className="font-heading font-bold text-lg leading-snug">
            Run the {protocol} attack yourself
          </h3>
          <p className="text-xs text-ink-soft leading-relaxed max-w-xl">
            Generate two throwaway wallets, fund them, manufacture a position, move the oracle,
            and borrow against a price that does not exist. 100% simulated - no real chain, no real
            funds.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-xs shrink-0">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        {stages.map((s, i) => {
          const Icon = STAGE_ICONS[i];
          const done = i < stage;
          const cur = i === stage;
          return (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  cur
                    ? 'bg-accent text-white'
                    : done
                    ? 'bg-accent/15 text-accent'
                    : 'bg-bg text-ink-faint'
                }`}
                title={s}
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
            <p className="text-sm text-ink-soft">
              An attacker never uses one wallet. Two identities let you trade against yourself -
              a wash trade - without a real counterparty.
            </p>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                const a = fakeAddress();
                const b = fakeAddress();
                setWalletA(a);
                setWalletB(b);
                pushLog(`+ generated Wallet-A  ${a.slice(0, 10)}…`);
                pushLog(`+ generated Wallet-B  ${b.slice(0, 10)}…`);
                setStage(1);
              }}
            >
              <Wallet className="w-4 h-4" /> Generate attacker wallets
            </Button>
          </>
        )}

        {stage === 1 && (
          <>
            <p className="text-sm text-ink-soft">
              Seed each Mango account. The real attacker put in about {usd(replay.seed)}{' '}
              per wallet, ~$10M total. Try a bigger seed - it still will not be enough to be honest
              about the position.
            </p>
            <Slider
              label="Seed per wallet (USDC)"
              value={seed}
              min={100000}
              max={10000000}
              step={100000}
              formatValue={(v) => usd(v)}
              onChange={setSeed}
            />
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                pushLog(`+ funded Wallet-A and Wallet-B: ${usd(seed)} each`);
                pushLog(`+ opened Mango Account-1 (long) and Account-2 (short)`);
                setStage(2);
              }}
            >
              <Droplets className="w-4 h-4" /> Fund both accounts
            </Button>
          </>
        )}

        {stage === 2 && (
          <>
            <p className="text-sm text-ink-soft">
              Now manufacture a huge position with no real counterparty: sell {(
                replay.position / 1e6
              ).toFixed(0)}
              M {replay.token}-perps from Account-1, buy all of it with Account-2. Same person,
              both sides.
            </p>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                pushLog(`> Account-1 SELL ${(replay.position / 1e6).toFixed(0)}M ${replay.token}-PERP @ ${usd(replay.entryPrice, 3)}`);
                pushLog(`> Account-2 BUY  ${(replay.position / 1e6).toFixed(0)}M ${replay.token}-PERP @ ${usd(replay.entryPrice, 3)}`);
                setPositionOpen(true);
                setStage(3);
              }}
            >
              <Scale className="w-4 h-4" /> Execute the wash trade
            </Button>
          </>
        )}

        {stage === 3 && (
          <>
            <p className="text-sm text-ink-soft">
              Spend real money buying {replay.token} on thin venues that feed the oracle. The shallower
              the market, the harder the price moves. Drag the buy size and watch the oracle.
            </p>
            <Slider
              label={`Buy amount of ${replay.token} (USDC)`}
              value={buy}
              min={0}
              max={replay.maxBuy}
              step={250000}
              formatValue={(v) => usd(v)}
              onChange={setBuy}
              helperText={`Oracle now reads ${usd(previewPrice, 3)} (${(previewPrice / replay.basePrice).toFixed(1)}x)`}
            />
            <div className="flex justify-between text-xs px-1">
              <span className="text-ink-soft">
                Base price <span className="font-mono font-semibold">{usd(replay.basePrice, 3)}</span>
              </span>
              <span className="text-ink-soft">
                Oracle after buy{' '}
                <span className="font-mono font-semibold text-danger">{usd(previewPrice, 3)}</span>
              </span>
            </div>
            <Button
              variant="primary"
              className="gap-2"
              disabled={buy <= 0}
              onClick={() => {
                pushLog(`> bought ${usd(buy)} of ${replay.token} across thin venues`);
                pushLog(`! oracle ${replay.token} = ${usd(previewPrice, 3)} (${(previewPrice / replay.basePrice).toFixed(1)}x)`);
                setPumped(true);
                setStage(4);
              }}
            >
              <Flame className="w-4 h-4" /> Execute the buys
            </Button>
          </>
        )}

        {stage === 4 && (
          <>
            <p className="text-sm text-ink-soft">
              The risk engine marks Account-1's {replay.token}-perp position at the fake oracle price.
              Unrealized profit becomes borrowable collateral. Withdraw as much real value as the
              protocol will allow.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <div className="text-ink-faint text-[10px] uppercase tracking-wide">Oracle price</div>
                <div className="font-mono font-bold text-danger">{usd(oraclePrice, 3)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <div className="text-ink-faint text-[10px] uppercase tracking-wide">Fake collateral</div>
                <div className="font-mono font-bold">{usd(inflatedProfit)}</div>
              </div>
            </div>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                pushLog(`> Account-1 collateral marked at ${usd(inflatedProfit)} (fake)`);
                pushLog(`<< WITHDRAW ${usd(extractable)} of real assets (BTC, USDT, SOL, mSOL)`);
                setExploited(true);
                setStage(5);
              }}
            >
              <HandCoins className="w-4 h-4" /> Borrow &amp; withdraw
            </Button>
          </>
        )}

        {stage === 5 && (
          <>
            <p className="text-sm text-ink-soft">
              {usd(withdrawn)} of real assets just left the protocol. Now stop buying - and watch the
              price snap back to where it started.
            </p>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                pushLog(`> attacker stops buying ${replay.token}`);
                pushLog(`! oracle collapses back to ${usd(replay.basePrice, 3)}`);
                pushLog(`xx protocol left with ~${usd(replay.availableAssets)} of bad debt`);
                setCollapsed(true);
                setStage(6);
              }}
            >
              <TrendingDown className="w-4 h-4" /> Stop buying
            </Button>
          </>
        )}

        {stage === 6 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-danger">
              <Skull className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm">
                  Drained: {usd(withdrawn)} - collateral was a fiction
                </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  You just extracted {usd(withdrawn)} against a collateral value that existed for
                  minutes. When the price reverted, the position was worth a fraction of the debt -
                  leaving the protocol insolvent and real users holding the loss. No bug was
                  exploited. Every transaction was valid. The price was simply a lie the oracle
                  believed.
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
        <Stat label="Wallet-A" value={walletA ? walletA.slice(0, 6) + '…' + walletA.slice(-4) : '—'} mono />
        <Stat label="Wallet-B" value={walletB ? walletB.slice(0, 6) + '…' + walletB.slice(-4) : '—'} mono />
        <Stat label="Position" value={positionOpen ? `${(replay.position / 1e6).toFixed(0)}M` : '—'} />
        <Stat label="Withdrawn" value={withdrawn > 0 ? usd(withdrawn) : '—'} danger />
      </div>

      {log.length > 0 && (
        <div className="p-3 rounded-xl bg-ink text-emerald-300 font-mono text-[10px] leading-relaxed max-h-40 overflow-y-auto space-y-0.5">
          <div className="flex items-center gap-1.5 text-ink-faint mb-1">
            <Terminal className="w-3 h-3" /> simulated on-chain log (fake addresses)
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
  mono,
  danger,
}: {
  label: string;
  value: string;
  mono?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="p-2.5 rounded-lg bg-bg border border-border space-y-0.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">{label}</div>
      <div
        className={`text-xs font-semibold truncate ${mono ? 'font-mono' : ''} ${
          danger ? 'text-danger' : 'text-ink'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
