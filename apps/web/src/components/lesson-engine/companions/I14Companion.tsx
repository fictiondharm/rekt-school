'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import {
  Vote,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Users,
  Coins,
  Clock,
  Lock,
  ChevronRight,
  TrendingDown,
  Gift,
} from 'lucide-react';

export function I14Companion() {
  const [activeTab, setActiveTab] = useState<'governance' | 'airdrop'>('governance');

  // Governance Simulator State
  const [hasTimelock, setHasTimelock] = useState<boolean>(false);
  const [hasSecurityCouncil, setHasSecurityCouncil] = useState<boolean>(false);
  const [hasVeLock, setHasVeLock] = useState<boolean>(false);
  const [attackExecuted, setAttackExecuted] = useState<boolean>(false);
  const [attackOutcome, setAttackOutcome] = useState<{
    success: boolean;
    drainedUSD: number;
    message: string;
    defenseLog: string[];
  } | null>(null);

  // Airdrop Simulator State
  const [airdropTotalTokens, setAirdropTotalTokens] = useState<number>(20); // 20M tokens
  const [mercenarySellPct, setMercenarySellPct] = useState<number>(75); // 75% sell
  const [poolDepthUSD, setPoolDepthUSD] = useState<number>(2); // $2M pool
  const [initialTokenPrice, setInitialTokenPrice] = useState<number>(0.50);

  // Execute Governance Simulation
  const handleSimulateAttack = () => {
    setAttackExecuted(true);
    const defenseLog: string[] = [];

    if (hasVeLock) {
      defenseLog.push('veToken Check: Flash-loaned tokens held for 1 block were rejected by voting contract (Requires 90+ day lock).');
      setAttackOutcome({
        success: false,
        drainedUSD: 0,
        message: 'Attack Defeated! The flash loan could not register voting weight.',
        defenseLog,
      });
      return;
    }

    if (hasSecurityCouncil) {
      defenseLog.push('Flash loan succeeded in passing quorum, but Squads 4/7 Security Council detected treasury drain.');
      defenseLog.push('Security Council veto instruction executed, canceling proposal before funds moved.');
      setAttackOutcome({
        success: false,
        drainedUSD: 0,
        message: 'Attack Defeated! Security council vetoed the malicious proposal.',
        defenseLog,
      });
      return;
    }

    if (hasTimelock) {
      defenseLog.push('48-Hour Timelock activated: Proposal passed, but queued for 48 hours.');
      defenseLog.push('92% of honest LPs withdrew their capital from the protocol before execution.');
      setAttackOutcome({
        success: false,
        drainedUSD: 1_200_000,
        message: 'Mitigated: Timelock allowed liquidity providers to exit safely. Attacker extracted only residual dust.',
        defenseLog,
      });
      return;
    }

    // No defenses active -> Full Treasury Drain
    defenseLog.push('No timelock: Proposal executed in the same block.');
    defenseLog.push('No veto council: Malicious transfer succeeded unhindered.');
    defenseLog.push('Entire $15,000,000 treasury transferred to attacker wallet.');
    setAttackOutcome({
      success: true,
      drainedUSD: 15_000_000,
      message: 'Catastrophic Exploit! Attacker successfully drained the entire DAO treasury.',
      defenseLog,
    });
  };

  const handleResetGov = () => {
    setAttackExecuted(false);
    setAttackOutcome(null);
  };

  // Airdrop calculations
  const totalTokensDumped = (airdropTotalTokens * 1e6 * mercenarySellPct) / 100;
  const initialPoolTokens = (poolDepthUSD * 1e6) / initialTokenPrice;
  // Constant product price impact: dx / (x + dx)
  const priceDrawdownPct = Math.min(
    95,
    Math.round((totalTokensDumped / (initialPoolTokens + totalTokensDumped)) * 100)
  );
  const postAirdropPrice = initialTokenPrice * (1 - priceDrawdownPct / 100);
  const retainedHoldersPct = 100 - mercenarySellPct;

  return (
    <Card className="p-6 space-y-6 border border-border shadow-card bg-surface text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-xl text-ink">DAO & Airdrop War Room</h2>
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Simulate flash-loan governance takeovers, timelock defenses, and post-airdrop market sell pressure.
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
              Lab Simulator
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              No real wallet · Nothing costs money
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-lg bg-surface-raised p-1 border border-border">
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'governance'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Governance Attack Lab
          </button>
          <button
            onClick={() => setActiveTab('airdrop')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'airdrop'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Airdrop Retention Sim
          </button>
        </div>
      </div>

      {/* TAB 1: GOVERNANCE FLASH-LOAN ATTACK SIMULATOR */}
      {activeTab === 'governance' && (
        <div className="space-y-5">
          {/* DAO Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-bg border border-border">
              <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">DAO Treasury</div>
              <div className="text-base font-mono font-semibold text-ink mt-0.5">$15,000,000</div>
              <div className="text-[10px] text-ink-soft mt-0.5">Liquid USDC & SOL</div>
            </div>

            <div className="p-3 rounded-xl bg-bg border border-border">
              <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Voting Quorum</div>
              <div className="text-base font-mono font-semibold text-ink mt-0.5">400,000 GOV</div>
              <div className="text-[10px] text-ink-soft mt-0.5">4% of total supply</div>
            </div>

            <div className="p-3 rounded-xl bg-bg border border-border">
              <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Honest Turnout</div>
              <div className="text-base font-mono font-semibold text-ink mt-0.5">300,000 GOV</div>
              <div className="text-[10px] text-ink-soft mt-0.5">200k Yes / 100k No</div>
            </div>

            <div className="p-3 rounded-xl bg-bg border border-border">
              <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Attacker Borrow</div>
              <div className="text-base font-mono font-semibold text-rose-600 mt-0.5">600,000 GOV</div>
              <div className="text-[10px] text-ink-soft mt-0.5">Flash-borrowed from DEX</div>
            </div>
          </div>

          {/* Defense Toggles */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3">
            <div className="text-xs font-medium text-ink flex items-center justify-between">
              <span>Protocol Governance Defense Stack</span>
              <span className="text-[10px] text-ink-soft">Toggle safeguards to test resilience</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setHasTimelock(!hasTimelock)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  hasTimelock
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border bg-bg hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>48h Timelock</span>
                  {hasTimelock ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-ink-soft" />
                  )}
                </div>
                <div className="text-[10px] text-ink-soft mt-1 leading-relaxed">
                  Enforces 48-hour delay before passed proposals can execute.
                </div>
              </button>

              <button
                onClick={() => setHasSecurityCouncil(!hasSecurityCouncil)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  hasSecurityCouncil
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border bg-bg hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Squads Veto Council</span>
                  {hasSecurityCouncil ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-ink-soft" />
                  )}
                </div>
                <div className="text-[10px] text-ink-soft mt-1 leading-relaxed">
                  4-of-7 community multisig with veto power over malicious drains.
                </div>
              </button>

              <button
                onClick={() => setHasVeLock(!hasVeLock)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  hasVeLock
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border bg-bg hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>veToken Time-Locking</span>
                  {hasVeLock ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Coins className="w-4 h-4 text-ink-soft" />
                  )}
                </div>
                <div className="text-[10px] text-ink-soft mt-1 leading-relaxed">
                  Requires 90+ days staking to vote; blocks flash loans completely.
                </div>
              </button>
            </div>
          </div>

          {/* Trigger Attack Button */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetGov}
              className="text-xs gap-1.5 text-ink-soft hover:text-ink"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulation</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSimulateAttack}
              className="text-xs font-medium gap-2 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Launch Flash-Loan Governance Hijack</span>
            </Button>
          </div>

          {/* Attack Simulation Result */}
          {attackOutcome && (
            <div
              className={`p-4 rounded-xl border space-y-3 animate-in fade-in duration-200 ${
                attackOutcome.success
                  ? 'border-rose-500/30 bg-rose-500/10'
                  : 'border-emerald-500/30 bg-emerald-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-heading font-semibold text-sm">
                  {attackOutcome.success ? (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  <span className={attackOutcome.success ? 'text-rose-900' : 'text-emerald-900'}>
                    {attackOutcome.message}
                  </span>
                </div>
                <Badge
                  variant={attackOutcome.success ? 'danger' : 'accent'}
                  className="text-xs font-mono font-bold"
                >
                  Treasury Lost: ${attackOutcome.drainedUSD.toLocaleString()}
                </Badge>
              </div>

              <div className="space-y-1.5 pt-1">
                {attackOutcome.defenseLog.map((log, i) => (
                  <div key={i} className="text-xs font-mono text-ink leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AIRDROP RETENTION & MERCENARY DUMP SIMULATOR */}
      {activeTab === 'airdrop' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-4">
            <div className="text-xs font-medium text-ink flex items-center justify-between">
              <span>Airdrop Parameters & DEX Liquidity</span>
              <span className="text-[10px] text-ink-soft">Adjust parameters to model post-claim sell pressure</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Slider
                  label="Total Airdrop Size"
                  value={airdropTotalTokens}
                  min={5}
                  max={100}
                  step={5}
                  unit="M"
                  formatValue={(val) => `${val}M tokens`}
                  onChange={(val) => setAirdropTotalTokens(val)}
                />
              </div>

              <div className="space-y-1.5">
                <Slider
                  label="Mercenary Dump Rate"
                  value={mercenarySellPct}
                  min={20}
                  max={95}
                  step={5}
                  unit="%"
                  onChange={(val) => setMercenarySellPct(val)}
                />
              </div>

              <div className="space-y-1.5">
                <Slider
                  label="DEX Pool Liquidity"
                  value={poolDepthUSD}
                  min={1}
                  max={20}
                  step={1}
                  unit="M"
                  formatValue={(val) => `$${val}M`}
                  onChange={(val) => setPoolDepthUSD(val)}
                />
              </div>
            </div>
          </div>

          {/* Airdrop Metrics Output */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-bg border border-border">
              <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Day-1 Sell Flow</div>
              <div className="text-base font-mono font-semibold text-ink mt-0.5">
                {(totalTokensDumped / 1e6).toFixed(1)}M tokens
              </div>
              <div className="text-[10px] text-ink-soft mt-0.5">{mercenarySellPct}% of recipients</div>
            </div>

            <div className="p-3 rounded-xl bg-bg border border-border">
              <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Price Drawdown</div>
              <div className="text-base font-mono font-semibold text-rose-600 mt-0.5">
                -{priceDrawdownPct}%
              </div>
              <div className="text-[10px] text-ink-soft mt-0.5">Slippage impact</div>
            </div>

            <div className="p-3 rounded-xl bg-bg border border-border">
              <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Post-Dump Price</div>
              <div className="text-base font-mono font-semibold text-ink mt-0.5">
                ${postAirdropPrice.toFixed(3)}
              </div>
              <div className="text-[10px] text-ink-soft mt-0.5">From ${initialTokenPrice.toFixed(2)}</div>
            </div>

            <div className="p-3 rounded-xl bg-bg border border-border">
              <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">Holder Retention</div>
              <div className="text-base font-mono font-semibold text-emerald-600 mt-0.5">
                {retainedHoldersPct}%
              </div>
              <div className="text-[10px] text-ink-soft mt-0.5">Long-term loyalists</div>
            </div>
          </div>

          {/* Retention Advice */}
          <div className="p-3.5 rounded-xl bg-bg border border-border space-y-1 text-xs">
            <div className="font-medium text-ink flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-primary" />
              <span>Institutional Takeaway:</span>
            </div>
            <p className="text-ink-soft leading-relaxed">
              When launching an airdrop on Solana, without staking incentives or time-phased unlock boosts, 70%+ of tokens are dumped within 48 hours. Protocols must ensure substantial secondary DEX liquidity depth (or bonding curves) to prevent catastrophic early price destruction.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
