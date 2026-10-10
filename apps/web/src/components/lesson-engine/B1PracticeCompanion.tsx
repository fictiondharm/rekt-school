'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Fuel,
  HelpCircle,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function B1PracticeCompanion() {
  const [activeTab, setActiveTab] = useState<'onboarding' | 'preview'>('onboarding');
  const [currentSetupStep, setCurrentSetupStep] = useState(1);
  const [isTourActive, setIsTourActive] = useState(false);

  // Preview simulator state
  const [txState, setTxState] = useState<'idle' | 'signing' | 'confirming' | 'success'>('idle');
  const [solBalance, setSolBalance] = useState(2.0);
  const [fusdcBalance, setFusdcBalance] = useState(10000);

  const handleTestTx = () => {
    setTxState('signing');
    setTimeout(() => {
      setTxState('confirming');
      setTimeout(() => {
        setTxState('success');
        setSolBalance((prev) => Math.max(0, prev - 0.000005));
        setFusdcBalance((prev) => prev - 25);
      }, 1000);
    }, 900);
  };

  const handleReset = () => {
    setActiveTab('onboarding');
    setCurrentSetupStep(1);
    setTxState('idle');
    setSolBalance(2.0);
    setFusdcBalance(10000);
  };

  const onboardingSteps = [
    {
      num: 1,
      title: 'Install Solflare or Phantom',
      desc: 'Get an authentic self-custodial wallet browser extension.',
    },
    {
      num: 2,
      title: 'Switch to Solana Devnet',
      desc: 'Set wallet network to Devnet for 100% free test money.',
    },
    {
      num: 3,
      title: 'Claim Test SOL',
      desc: 'Grab free devnet SOL from the official Solana faucet to pay micro-fees.',
    },
  ];

  const tourSteps = [
    {
      target: '[data-tour="onboarding-tabs"]',
      title: 'Chapter 0: Onboarding Hub',
      text: 'Switch between the step-by-step wallet setup guide and the interactive live transaction preview.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="setup-steps-nav"]',
      title: 'The 3 Setup Milestones',
      text: 'Follow these 3 simple steps to set up your Solana Devnet environment and grab free test SOL.',
      side: 'bottom' as const,
    },
  ];

  return (
    <div className="w-full max-w-lg space-y-5">
      {/* Tour Wrapper */}
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="primary" className="text-[10px]">
            CHAPTER 0 • GETTING STARTED
          </Badge>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTourActive(true)}
              className="gap-1.5 text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent" /> Spotlight Tour
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </div>
        <h3 className="font-heading font-bold text-xl text-ink">
          Solana Devnet Setup & Faucet Hub
        </h3>
        <p className="text-xs text-ink-soft">
          Complete your 3-minute wallet onboarding and switch to Devnet. You will grab free test SOL and mint your fUSDC in the coming lessons.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
            Sandbox
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            No real wallet · Nothing costs money
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div data-tour="onboarding-tabs" className="flex border-b border-border text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('onboarding')}
          className={`flex-1 py-2.5 border-b-2 transition-colors ${
            activeTab === 'onboarding'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          1. Wallet & Faucet Setup
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2.5 border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          2. Live Transaction Sandbox
        </button>
      </div>

      {activeTab === 'onboarding' ? (
        <Card className="p-6 space-y-5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg">
          {/* Step Progress Pills */}
          <div data-tour="setup-steps-nav" className="grid grid-cols-3 gap-1.5 pb-2 border-b border-border">
            {onboardingSteps.map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentSetupStep(step.num)}
                className={`p-2 rounded-lg transition-all ${
                  currentSetupStep === step.num
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-bg text-ink-soft hover:bg-accent/10 font-semibold text-[11px]'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider">Step</div>
                <div className="text-xs font-heading">{step.num}</div>
              </button>
            ))}
          </div>

          {/* STEP 1: INSTALL WALLET */}
          {currentSetupStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Step 1 of 3
                </span>
        <h4 className="font-heading font-bold text-base text-ink">
          Install a Web3 Solana Wallet
        </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  A self-custodial wallet holds your private keys so you can interact with decentralized protocols. Choose either Solflare or Phantom:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Solflare Card */}
                <div className="p-3.5 rounded-xl border border-border bg-bg space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-600 font-bold text-sm">
                      S
                    </div>
                    <h5 className="font-heading font-bold text-sm text-ink">Solflare Wallet</h5>
                    <p className="text-[11px] text-ink-soft leading-relaxed">
                      Built specifically for Solana with native developer network controls and robust simulation security.
                    </p>
                  </div>
                  <a
                    href="https://solflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-xs"
                  >
                    <span>Install Solflare</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Phantom Card */}
                <div className="p-3.5 rounded-xl border border-border bg-bg space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 font-bold text-sm">
                      P
                    </div>
                    <h5 className="font-heading font-bold text-sm text-ink">Phantom Wallet</h5>
                    <p className="text-[11px] text-ink-soft leading-relaxed">
                      Widely used multi-chain wallet with clean UI, transaction previews, and easy testnet toggles.
                    </p>
                  </div>
                  <a
                    href="https://phantom.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-xs"
                  >
                    <span>Install Phantom</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentSetupStep(2)}
                  className="gap-1.5 text-xs"
                >
                  <span>Next: Switch to Devnet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SWITCH TO DEVNET */}
          {currentSetupStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Step 2 of 3
                </span>
        <h4 className="font-heading font-bold text-base text-ink">
          Switch Network to "Solana Devnet"
        </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Solana has two main environments: <strong>Mainnet-Beta</strong> (real money) and <strong>Devnet</strong> (free play money). We exclusively use Devnet!
                </p>
              </div>

              {/* Visual Walkthrough Cards */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-1.5 text-xs">
                  <div className="font-bold text-orange-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    In Solflare:
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-ink-soft text-[11px]">
                    <li>Open Solflare extension in your browser</li>
                    <li>Click the <strong>Settings (gear icon)</strong> at the bottom right</li>
                    <li>Click <strong>Network</strong> &gt; Select <strong>Devnet</strong></li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1.5 text-xs">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    In Phantom:
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-ink-soft text-[11px]">
                    <li>Open Phantom extension</li>
                    <li>Click the <strong>Settings (gear icon)</strong></li>
                    <li>Scroll down to <strong>Developer Settings</strong></li>
                    <li>Toggle <strong>Testnet Mode ON</strong> &gt; Select <strong>Solana Devnet</strong></li>
                  </ol>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentSetupStep(1)}
                  className="text-xs"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentSetupStep(3)}
                  className="gap-1.5 text-xs"
                >
                  <span>Next: Claim Test SOL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CLAIM TEST SOL */}
          {currentSetupStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Step 3 of 3
                </span>
        <h4 className="font-heading font-bold text-base text-ink">
          Claim Free Devnet Gas (SOL)
        </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Every transaction on Solana requires a micro-fee (~0.000005 SOL, or 5,000 lamports) paid to network validators. Grab free Devnet SOL from the official faucet:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-bg border border-border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-500" /> Official Solana Devnet Faucet
                  </span>
                  <Badge variant="devnet" className="text-[10px]">FREE SOL</Badge>
                </div>

                <p className="text-[11px] text-ink-soft leading-relaxed">
                  Devnet SOL pays the tiny network fees (~0.000005 SOL per transaction). No simulation here —
                  open the official Solana faucet, paste your wallet address, and grab real devnet SOL for free.
                </p>

                <a
                  href="https://faucet.solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-accent text-white border-2 border-ink font-bold text-xs shadow-pop hover:shadow-pop-hover hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
                >
                  <Fuel className="w-4 h-4" />
                  <span>Claim Devnet SOL at faucet.solana.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="pt-2 flex justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentSetupStep(2)}
                  className="text-xs"
                >
                  Back
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  className="gap-1.5 text-xs"
                >
                  <span>Finish: Open Live Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* LIVE TRANSACTION SANDBOX PREVIEW */
        <Card className="p-6 space-y-5 bg-surface border-2 border-ink rounded-xl shadow-pop-lg">
          {/* Mock Wallet Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-sm text-ink">
                  Simulated Devnet Account
                </div>
                <div className="text-xs font-mono text-ink-soft">Devn4wK...8zY2</div>
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="font-mono font-bold text-sm text-accent">
                {solBalance.toFixed(4)} SOL
              </div>
              <div className="font-mono font-bold text-xs text-accent">
                {fusdcBalance.toLocaleString()} fUSDC
              </div>
            </div>
          </div>

          {/* Action Simulator */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-ink">Action: Test AMM Swap</span>
              <span className="text-accent font-mono font-bold">Swap: 25 fUSDC → SOL</span>
            </div>

            <div className="p-3.5 rounded-xl bg-bg border border-border text-xs text-ink-soft leading-relaxed flex items-center justify-between">
              <span>Send 25 fUSDC to pool & receive SOL</span>
              <ArrowRight className="w-4 h-4 text-accent shrink-0" />
            </div>

            {txState === 'idle' && (
              <Button variant="primary" onClick={handleTestTx} className="w-full gap-2">
                <ArrowRight className="w-4 h-4" /> Sign & Send Devnet Transaction
              </Button>
            )}

            {txState === 'signing' && (
              <Button variant="primary" isLoading={true} className="w-full">
                Waiting for wallet signature approval...
              </Button>
            )}

            {txState === 'confirming' && (
              <Button variant="secondary" isLoading={true} className="w-full">
                Confirming on Solana Devnet validators...
              </Button>
            )}

            {txState === 'success' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-accent/10 border-2 border-ink shadow-pop-lg text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>Transaction confirmed on Solana Devnet!</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-800 break-all">
                    Signature: 5Kq9m...xL2w9Pq4
                  </div>
                  <div className="text-[11px] text-emerald-900">
                    Network Fee: 0.000005 SOL ($0.00) • Finalized in 420ms
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTxState('idle')}
                  className="w-full gap-2 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Sandbox
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
