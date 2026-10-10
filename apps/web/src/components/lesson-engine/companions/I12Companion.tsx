'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Lock,
  Layers,
  Bug,
  Code2,
  FileSearch,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface ExploitCase {
  id: string;
  title: string;
  date: string;
  lossUSD: string;
  category: 'Economic Mechanism Flaw' | 'Smart Contract Bug';
  chain: string;
  description: string;
  steps: {
    title: string;
    description: string;
    stateLabel: string;
    metricA: { label: string; value: string };
    metricB: { label: string; value: string };
    isVulnerable: boolean;
  }[];
  patchSummary: string;
  patchRule: string;
  mitigationCode: string;
}

const EXPLOIT_CASES: ExploitCase[] = [
  {
    id: 'mango',
    title: 'Mango Markets ($114M)',
    date: 'October 2022',
    lossUSD: '$114,000,000',
    category: 'Economic Mechanism Flaw',
    chain: 'Solana',
    description:
      'Attacker manipulated thin spot DEX liquidity to pump MNGO token price 24x, using artificial paper gains as cross-margin collateral to borrow all blue-chip assets.',
    steps: [
      {
        title: 'Step 1: Position Placement',
        description: 'Attacker funds two accounts (A & B) with $5M USDC each. Account A takes a huge short position while Account B takes an equal long position on MNGO perps.',
        stateLabel: 'Equilibrium (Balanced delta)',
        metricA: { label: 'MNGO Spot Price', value: '$0.038' },
        metricB: { label: 'Account B Paper Equity', value: '$5,000,000' },
        isVulnerable: false,
      },
      {
        title: 'Step 2: Thin Pool Spot Manipulation',
        description: 'Attacker buys aggressive spot orders on thin AMM liquidity pools (AscendEX & Raydium). The spot oracle price rockets from $0.038 to $0.91 within minutes.',
        stateLabel: 'Oracle Price Shock',
        metricA: { label: 'MNGO Spot Price', value: '$0.910 (↑2,300%)' },
        metricB: { label: 'Account B Paper Equity', value: '$420,000,000' },
        isVulnerable: true,
      },
      {
        title: 'Step 3: Protocol Drain via Borrowing',
        description: "Mango's risk engine evaluates Account B's mark-to-market paper gains as valid cross-collateral. Attacker borrows $114M of real SOL, USDC, and BTC.",
        stateLabel: 'Insolvency / Protocol Drained',
        metricA: { label: 'Bad Debt Incurred', value: '$114,000,000' },
        metricB: { label: 'Remaining Protocol Reserves', value: '$0 (Empty)' },
        isVulnerable: true,
      },
      {
        title: 'Step 4: Modern Defense Verification',
        description: 'Under modern risk architecture with Pyth Confidence Bands and isolated borrow caps, this transaction is rejected before execution.',
        stateLabel: 'Attack Neutralized by Protocol Guard',
        metricA: { label: 'Pyth Confidence Interval', value: '±$0.45 (Dispersed)' },
        metricB: { label: 'Illiquid Borrow Cap', value: 'Max $1.5M exposure' },
        isVulnerable: false,
      },
    ],
    patchSummary: 'Enforced Pyth Confidence Interval checks, multi-hour TWAP oracles, and strict isolated collateral tiers that prevent illiquid tokens from borrowing blue-chips.',
    patchRule: 'Never allow illiquid tokens to cross-margin borrow liquid reserves without strict asset caps.',
    mitigationCode: `// Modern Defense: Pyth Confidence Interval Check
let pyth_price = oracle_account.get_price_no_older_than(60)?;
if pyth_price.conf > (pyth_price.price / 10) {
    // If uncertainty bounds exceed 10%, reject price update!
    return err!(RiskError::OracleConfidenceTooWide);
}

// Modern Defense: Hard Borrow Limit
require!(
    total_mngo_borrowed + requested_borrow <= MAX_MNGO_GLOBAL_BORROW,
    RiskError::BorrowLimitExceeded
);`,
  },
  {
    id: 'wormhole',
    title: 'Wormhole Bridge ($325M)',
    date: 'February 2022',
    lossUSD: '$325,000,000',
    category: 'Smart Contract Bug',
    chain: 'Solana / Ethereum',
    description:
      'Attacker bypassed cryptographic signature verification by spoofing the Solana system instruction program account, minting 120,000 wrapped ETH with no collateral.',
    steps: [
      {
        title: 'Step 1: Target Signature Verifier',
        description: 'Wormhole on Solana relies on 19 Guardian signatures inside a VAA (Verified Action Approval) to confirm real ETH was locked on Ethereum.',
        stateLabel: 'Normal Bridge Operation',
        metricA: { label: 'Guardians Required', value: '13 of 19 (Quorum)' },
        metricB: { label: 'whETH Solana Supply', value: '100% Backed' },
        isVulnerable: false,
      },
      {
        title: 'Step 2: Sysvar Instruction Substitution',
        description: 'The Solana contract called an outdated verify instruction parser without asserting that the executed account was the real sysvar::instructions program.',
        stateLabel: 'Account Address Spoofed',
        metricA: { label: 'Submitted Account', value: 'Fake Instruction Sysvar' },
        metricB: { label: 'Signature Check', value: 'Bypassed' },
        isVulnerable: true,
      },
      {
        title: 'Step 3: Mint 120,000 whETH',
        description: 'Because the fake account returned a successful verification status, Wormhole minted 120,000 wrapped ETH on Solana with zero backing collateral.',
        stateLabel: 'Collateral Desynchronization',
        metricA: { label: 'whETH Minted', value: '120,000 whETH ($325M)' },
        metricB: { label: 'Real ETH Locked', value: '0 ETH' },
        isVulnerable: true,
      },
      {
        title: 'Step 4: Modern Defense Verification',
        description: 'Anchor framework now enforces hard-coded sysvar address matching at compile time via explicit #[account(address = sysvar::instructions::ID)] constraints.',
        stateLabel: 'Attack Neutralized by Account Constraint',
        metricA: { label: 'Account Constraint Check', value: 'Enforced at entry' },
        metricB: { label: 'Spoof Attempt', value: 'Rejected (Error 2003)' },
        isVulnerable: false,
      },
    ],
    patchSummary: 'Upgraded Solana instruction verification to strictly check the official sysvar::instructions public key, completely eliminating account spoofing.',
    patchRule: 'Always verify program IDs and sysvar addresses explicitly using Anchor constraints.',
    mitigationCode: `// Modern Anchor Defense: Explicit Account Address Verification
#[account(
    address = anchor_lang::solana_program::sysvar::instructions::ID 
    @ BridgeError::InvalidInstructionsSysvar
)]
pub instructions_sysvar: AccountInfo<'info>,

// Cryptographic Guardian Quorum Verification
let guardian_set = load_guardian_set(&ctx.accounts.guardian_set)?;
require!(
    verify_guardian_quorum(&vaa_signatures, &guardian_set)?,
    BridgeError::InvalidSignatureQuorum
);`,
  },
];

export function I12Companion() {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showPatchMode, setShowPatchMode] = useState<boolean>(false);
  const [completedCases, setCompletedCases] = useState<Record<string, boolean>>({});

  const activeCase = EXPLOIT_CASES[selectedCaseIndex];
  const activeStep = activeCase.steps[activeStepIndex];

  const handleSelectCase = (index: number) => {
    setSelectedCaseIndex(index);
    setActiveStepIndex(0);
    setShowPatchMode(false);
  };

  const handleNextStep = () => {
    if (activeStepIndex < activeCase.steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      // Mark as completed
      setCompletedCases((prev) => ({ ...prev, [activeCase.id]: true }));
      setShowPatchMode(true);
    }
  };

  const handleReset = () => {
    setActiveStepIndex(0);
    setShowPatchMode(false);
  };

  return (
    <Card className="p-6 space-y-6 border border-border shadow-card bg-surface text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-xl text-ink">Historical Exploit Replayer</h2>
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Step through historic DeFi catastrophes to understand root vulnerabilities and modern institutional patches.
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

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono font-bold px-2.5 py-1">
            {Object.keys(completedCases).length} / {EXPLOIT_CASES.length} Analyzed
          </Badge>
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPLOIT_CASES.map((exploit, idx) => {
          const isSelected = selectedCaseIndex === idx;
          const isDone = completedCases[exploit.id];
          return (
            <button
              key={exploit.id}
              onClick={() => handleSelectCase(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary-light/50 font-medium shadow-xs'
                  : 'border-border bg-surface-raised hover:bg-bg'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-semibold text-ink">{exploit.title}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {exploit.lossUSD}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-ink-soft">
                <span>{exploit.chain}</span>
                <span>•</span>
                <span>{exploit.category}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Case Overview */}
      <div className="p-4 rounded-xl bg-bg border border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-ink flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <span>Incident Briefing: {activeCase.title}</span>
          </div>
          <Badge
            variant={activeCase.category === 'Smart Contract Bug' ? 'danger' : 'warn'}
            className="text-[10px] uppercase font-medium"
          >
            {activeCase.category}
          </Badge>
        </div>
        <p className="text-xs text-ink-soft leading-relaxed">{activeCase.description}</p>
      </div>

      {/* Step Progress Tracker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-heading font-semibold text-ink-soft uppercase text-[10px] tracking-wider">
            Exploit Execution Timeline
          </span>
          <span className="font-mono text-xs text-ink-soft font-semibold">
            Stage {activeStepIndex + 1} of {activeCase.steps.length}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {activeCase.steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === activeStepIndex
                  ? 'bg-primary'
                  : idx < activeStepIndex
                  ? 'bg-primary/40'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Interactive Step Card */}
      <div
        className={`p-5 rounded-xl border space-y-4 transition-all ${
          activeStep.isVulnerable
            ? 'border-rose-500/30 bg-rose-500/5'
            : 'border-border bg-surface-raised'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-heading font-semibold text-ink flex items-center gap-2">
            {activeStep.isVulnerable ? (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
            <span>{activeStep.title}</span>
          </div>
          <Badge
            variant={activeStep.isVulnerable ? 'danger' : 'accent'}
            className="text-[10px] font-mono"
          >
            {activeStep.stateLabel}
          </Badge>
        </div>

        <p className="text-xs text-ink-soft leading-relaxed">{activeStep.description}</p>

        {/* Live Step Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-surface border border-border">
            <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">
              {activeStep.metricA.label}
            </div>
            <div className="text-sm font-mono font-semibold text-ink mt-0.5">
              {activeStep.metricA.value}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border">
            <div className="text-[10px] text-ink-soft uppercase font-medium tracking-wider">
              {activeStep.metricB.label}
            </div>
            <div className="text-sm font-mono font-semibold text-ink mt-0.5">
              {activeStep.metricB.value}
            </div>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs gap-1.5 text-ink-soft hover:text-ink"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Timeline</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNextStep}
            className="text-xs font-medium gap-1.5"
          >
            <span>
              {activeStepIndex === activeCase.steps.length - 1
                ? 'Review Modern Defense'
                : 'Simulate Next Attack Step'}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Modern Defense / Patch Section */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>The Institutional Defense: How Protocols Prevent This Today</span>
          </div>
          <button
            onClick={() => setShowPatchMode(!showPatchMode)}
            className="text-[11px] font-semibold text-emerald-700 hover:underline"
          >
            {showPatchMode ? 'Hide Code' : 'View Anchor Code'}
          </button>
        </div>

        <p className="text-xs text-ink-soft leading-relaxed">{activeCase.patchSummary}</p>

        <div className="p-2.5 rounded-lg bg-surface border border-emerald-500/20 text-[11px] text-emerald-900 font-medium">
          <strong>Architectural Rule:</strong> {activeCase.patchRule}
        </div>

        {showPatchMode && (
          <div className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 animate-in fade-in duration-200">
            <pre>{activeCase.mitigationCode}</pre>
          </div>
        )}
      </div>
    </Card>
  );
}
