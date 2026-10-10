'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  FileCode,
} from 'lucide-react';

interface ScamCase {
  id: string;
  title: string;
  simulationWarning: string;
  riskLevel: 'critical' | 'high' | 'safe';
  details: string;
  isScam: boolean;
  explanation: string;
}

const CASES: ScamCase[] = [
  {
    id: 'drainer-approval',
    title: 'Claim Exclusive Free Airdrop (10,000 $SOLAIR)',
    simulationWarning: 'Program requests Delegate Authority over all Token Accounts owned by your wallet.',
    riskLevel: 'critical',
    details: 'Instruction: SetAuthority(Delegate, UnverifiedAccount, MaxUint64)',
    isScam: true,
    explanation: 'DANGER! This transaction grants an unverified third-party address total delegate approval to drain all your token accounts without asking for your password again!',
  },
  {
    id: 'jupiter-swap',
    title: 'Swap 50 fUSDC for 0.25 SOL on Jupiter',
    simulationWarning: 'Expected balance changes: -50.00 fUSDC, +0.2488 SOL (Network fee: 0.000005 SOL)',
    riskLevel: 'safe',
    details: 'Instruction: Jupiter Aggregator v6 -> Raydium CPMM Pool Swap',
    isScam: false,
    explanation: 'SAFE! Balanced trade where you receive proportional tokens minus standard network fees. No authority changes or dangerous delegates requested.',
  },
  {
    id: 'honeypot-token',
    title: 'Buy New 1000x Moon Token ($MOONX)',
    simulationWarning: 'Contract contains Transfer Hook that rejects all outbound sell orders.',
    riskLevel: 'high',
    details: 'Instruction: Token-2022 Transfer Hook: if (dest != creator) revert("Trading paused")',
    isScam: true,
    explanation: 'HONEYPOT! The smart contract was written with a malicious transfer hook that lets you buy tokens, but permanently blocks you from ever selling them back to the market!',
  },
];

export function B10Companion() {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<'approved' | 'rejected' | null>(null);
  const [score, setScore] = useState(0);

  const currentCase = CASES[currentCaseIndex];

  const handleDecision = (decision: 'approved' | 'rejected') => {
    setUserChoice(decision);
    const correct = (currentCase.isScam && decision === 'rejected') || (!currentCase.isScam && decision === 'approved');
    if (correct) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    setUserChoice(null);
    setCurrentCaseIndex((prev) => (prev + 1) % CASES.length);
  };

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <Badge variant="warn" className="mb-1">
          LAB B10 • TRANSACTION SIMULATOR
        </Badge>
        <h3 className="font-heading font-semibold text-xl text-ink">
          Spot the Scam Transaction Analyzer
        </h3>
        <p className="text-xs text-ink-soft">
          Inspect wallet pre-flight simulation warnings and decide whether to Approve or Reject.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        {/* Mock Wallet Pre-Flight Screen */}
        <div className="p-4 rounded-xl bg-bg border border-border space-y-3">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-border">
            <span className="font-medium text-ink">Pre-Flight Simulation Screen</span>
            <Badge
              variant={
                currentCase.riskLevel === 'critical'
                  ? 'danger'
                  : currentCase.riskLevel === 'high'
                  ? 'warn'
                  : 'accent'
              }
              className="text-[10px]"
            >
              {currentCase.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>

          <div className="space-y-1">
            <h4 className="font-heading font-semibold text-sm text-ink">{currentCase.title}</h4>
            <div className="p-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-ink-soft">
              {currentCase.details}
            </div>
          </div>

          {/* Simulation Warning Box */}
          <div
            className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
              currentCase.riskLevel === 'critical'
                ? 'bg-red-50 border-red-300 text-red-900'
                : currentCase.riskLevel === 'high'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            {currentCase.riskLevel === 'safe' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <strong>Simulation Warning:</strong> {currentCase.simulationWarning}
            </div>
          </div>
        </div>

        {/* Action Decision Buttons */}
        {!userChoice ? (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="danger"
              onClick={() => handleDecision('rejected')}
              className="text-xs h-10 gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Reject (Flag as Scam)
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDecision('approved')}
              className="text-xs h-10 gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Transaction
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-1 animate-in fade-in duration-200">
            {/* Outcome Result */}
            {((currentCase.isScam && userChoice === 'rejected') || (!currentCase.isScam && userChoice === 'approved')) ? (
              <div className="p-3.5 rounded-xl bg-accent-light border border-accent/40 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-accent">
                  <CheckCircle2 className="w-4 h-4" /> Correct Decision!
                </div>
                <p className="leading-relaxed">{currentCase.explanation}</p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-danger-light border border-danger/40 text-xs text-red-950 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-red-700">
                  <XCircle className="w-4 h-4" /> You Got Rekt!
                </div>
                <p className="leading-relaxed">{currentCase.explanation}</p>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={handleNext}
              className="w-full text-xs"
            >
              Next Scenario ({currentCaseIndex + 1}/{CASES.length})
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
