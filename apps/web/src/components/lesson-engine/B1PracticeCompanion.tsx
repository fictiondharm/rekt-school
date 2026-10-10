'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Lightbulb,
  RefreshCw,
  Fuel,
  Coins,
  Copy,
  Check,
  HelpCircle,
  Laptop,
  CheckCircle,
  Layers,
} from 'lucide-react';
import { COURSE_PROGRAM_IDS } from '@/lib/solana';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function B1PracticeCompanion() {
  const [activeTab, setActiveTab] = useState<'onboarding' | 'preview'>('onboarding');
  const [currentSetupStep, setCurrentSetupStep] = useState(1);
  const [copiedCA, setCopiedCA] = useState(false);
  const [claimedGas, setClaimedGas] = useState(false);
  const [claimedFusdc, setClaimedFusdc] = useState(false);
  const [gasLoading, setGasLoading] = useState(false);
  const [fusdcLoading, setFusdcLoading] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  // Preview simulator state
  const [txState, setTxState] = useState<'idle' | 'signing' | 'confirming' | 'success'>('idle');
  const [solBalance, setSolBalance] = useState(2.0);
  const [fusdcBalance, setFusdcBalance] = useState(10000);

  const fusdcCA = COURSE_PROGRAM_IDS.FUSDC_MINT;

  const handleCopyCA = () => {
    navigator.clipboard.writeText(fusdcCA);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  const handleClaimGas = () => {
    setGasLoading(true);
    setTimeout(() => {
      setGasLoading(false);
      setClaimedGas(true);
      setSolBalance((prev) => prev + 0.5);
    }, 900);
  };

  const handleClaimFusdc = () => {
    setFusdcLoading(true);
    setTimeout(() => {
      setFusdcLoading(false);
      setClaimedFusdc(true);
      setFusdcBalance((prev) => prev + 10000);
    }, 900);
  };

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
      desc: 'Get devnet SOL to pay micro-fees for all smart contract interactions.',
    },
    {
      num: 4,
      title: 'Claim 10,000 fUSDC & Add CA',
      desc: 'Import the course test token Contract Address into your wallet.',
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
      title: 'The 4 Setup Milestones',
      text: 'Follow these 4 simple steps to set up your Solana Devnet environment and claim your test funds.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="ca-copy-card"]',
      title: 'Contract Address (CA)',
      text: 'Click here to copy the fUSDC Contract Address. You will paste this into your wallet to view your 10,000 fUSDC!',
      side: 'top' as const,
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
        <div className="flex items-center justify-center gap-2">
          <Badge variant="primary" className="text-[10px]">
            CHAPTER 0 • GETTING STARTED
          </Badge>
          <button
            type="button"
            onClick={() => setIsTourActive(true)}
            className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Spotlight Tour
          </button>
        </div>
        <h3 className="font-heading font-bold text-xl text-ink">
          Solana Devnet Setup & Faucet Hub
        </h3>
        <p className="text-xs text-ink-soft">
          Complete your 3-minute wallet onboarding, switch to Devnet, and claim 10,000 fUSDC.
        </p>
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
          <div data-tour="setup-steps-nav" className="grid grid-cols-4 gap-1.5 pb-2 border-b border-border">
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
                  Step 1 of 4
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
                  Step 2 of 4
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
                  Step 3 of 4
                </span>
        <h4 className="font-heading font-bold text-base text-ink">
          Claim Free Devnet Gas (SOL)
        </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Every transaction on Solana requires a micro-fee (~0.000005 SOL, or 5,000 lamports) paid to network validators. Claim free Devnet SOL below:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-bg border border-border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-500" /> Instant Faucet Airdrop
                  </span>
                  <Badge variant="devnet" className="text-[10px]">0.50 SOL</Badge>
                </div>

                <Button
                  variant="primary"
                  onClick={handleClaimGas}
                  isLoading={gasLoading}
                  className="w-full text-xs gap-1.5"
                >
                  {claimedGas ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>Claimed +0.5 SOL!</span>
                    </>
                  ) : (
                    <>
                      <Fuel className="w-4 h-4" />
                      <span>Request 0.5 Devnet SOL</span>
                    </>
                  )}
                </Button>

                <div className="pt-1 text-[11px] text-ink-soft flex items-center justify-between">
                  <span>Need more? Official Solana Faucet:</span>
                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent font-bold hover:underline flex items-center gap-0.5"
                  >
                    faucet.solana.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
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
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentSetupStep(4)}
                  className="gap-1.5 text-xs"
                >
                  <span>Next: Claim 10,000 fUSDC</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: CLAIM 10,000 fUSDC & CONTRACT ADDRESS (CA) */}
          {currentSetupStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Step 4 of 4
                </span>
                <h4 className="font-heading font-bold text-base text-ink">
                  Claim 10,000 fUSDC & Add via Contract Address (CA)
                </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  We mint <strong>10,000 fUSDC</strong> (fake USDC) into your account. To view your tokens inside Phantom or Solflare, import the Contract Address (CA) below!
                </p>
              </div>

              {/* 10,000 fUSDC Faucet Button */}
              <Button
                variant="primary"
                onClick={handleClaimFusdc}
                isLoading={fusdcLoading}
                className="w-full text-xs h-10 gap-2 shadow-sm"
              >
                {claimedFusdc ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    <span>Minted 10,000 fUSDC!</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Claim 10,000 fUSDC into Token Account</span>
                  </>
                )}
              </Button>

              {/* Contract Address Box */}
              <div data-tour="ca-copy-card" className="p-3.5 rounded-xl bg-bg border border-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-accent" /> fUSDC Contract Address (CA)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCA}
                    className="flex items-center gap-1 text-[11px] font-bold text-accent hover:text-accent-hover"
                  >
                    {copiedCA ? (
                      <>
                        <Check className="w-3 h-3 text-accent" />
                        <span className="text-accent">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy CA</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="font-mono text-[11px] text-ink break-all bg-surface p-2 rounded-lg border border-border select-all">
                  {fusdcCA}
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-border text-[11px] text-ink-soft space-y-1">
                  <strong className="text-ink block">How to add custom token to your wallet:</strong>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Copy the CA above</li>
                    <li>In Phantom/Solflare, scroll to bottom &gt; click <strong>Manage token list</strong> (or <strong>+</strong>)</li>
                    <li>Paste the CA in the search field</li>
                    <li>Click <strong>Import</strong>. Your 10,000 fUSDC balance will now show!</li>
                  </ol>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentSetupStep(3)}
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
                  <span>Launch Live Sandbox</span>
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
