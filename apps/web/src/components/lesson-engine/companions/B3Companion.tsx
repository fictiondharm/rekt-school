'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Flame,
  Skull,
  Lock,
  Download,
  ExternalLink,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function B3Companion() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showRedAlert, setShowRedAlert] = useState(false);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  const sampleSeedWords = [
    'banana', 'galaxy', 'rocket', 'matrix',
    'velvet', 'crypto', 'shadow', 'orange',
    'timber', 'silver', 'planet', 'dragon',
  ];

  const tourSteps = [
    {
      target: '[data-tour="b3-seed-vault"]',
      title: 'The Seed Phrase Vault',
      text: 'This is how a real 12-word recovery phrase is stored. Words stay blurred until you deliberately reveal them, exactly like a wallet backup screen.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="b3-wallet-hub"]',
      title: 'Official Wallet Extensions',
      text: 'Only ever install wallets from these verified direct links. Typing "phantom" into a search engine is how most people download a fake drainer.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="b3-phishing-list"]',
      title: 'Spot The Phishing Scam',
      text: 'Tap any scenario to inspect the URL and popup text, then read the verdict. Rehearse here so you recognize the pattern instantly in the wild.',
      side: 'top' as const,
    },
  ];

  const handleRevealSeed = () => {
    setIsRevealed(true);
    setShowRedAlert(true);
    setTimeout(() => {
      setShowRedAlert(false);
    }, 4000);
  };

  const handleReset = () => {
    setIsRevealed(false);
    setShowRedAlert(false);
    setSelectedCase(null);
  };

  const scenarios = [
    {
      id: 1,
      title: 'Fake Search Engine Ad',
      url: 'https://phantom-airdrop-reward.xyz',
      popup: 'Prompt: Enter 12-word recovery phrase to claim $500 bonus SOL',
      isScam: true,
      explanation: 'Fake URL harvesting seed phrases! Real airdrops NEVER ask for your seed phrase.',
    },
    {
      id: 2,
      title: 'Official Decentralized Exchange',
      url: 'https://jup.ag',
      popup: 'Instruction: Swap 10 fUSDC for SOL (Min guaranteed: 0.049 SOL)',
      isScam: false,
      explanation: 'Legitimate decentralized exchange route with transparent slippage protection.',
    },
    {
      id: 3,
      title: 'Telegram / Discord "Support" DM',
      url: 'https://solana-helpdesk-validation.com',
      popup: 'Admin: "Please validate your wallet by sharing your private key or seed phrase"',
      isScam: true,
      explanation: 'Classic social engineering drainer! Support staff will NEVER ask for private keys or seed phrases.',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      {/* FULL SCREEN EMERGENCY RED FLASH OVERLAY */}
      {showRedAlert && (
        <div className="fixed inset-0 z-50 bg-red-600/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-300">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
            <Skull className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-semibold tracking-tight mb-2 uppercase">
            EMERGENCY SECURITY ALERT!
          </h2>
          <p className="max-w-md text-base sm:text-lg font-semibold leading-relaxed mb-6">
            NEVER SHARE THESE 12 WORDS WITH ANYONE! <br />
            NOT SUPPORT, NOT ADMINS, NOT EVEN DEFI MOMMY!
          </p>
          <div className="bg-black/40 border border-white/30 rounded-xl p-4 max-w-lg text-xs leading-relaxed">
            Anyone who acquires your seed phrase has total, irreversible cryptographic ownership of your entire wallet.
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowRedAlert(false)}
            className="mt-6 text-xs bg-white text-red-700 font-medium hover:bg-neutral-100"
          >
            I Understand: I Will Never Share It
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="warn" className="mb-1">
            SECURITY LAB: B3
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
        <h3 className="font-heading font-semibold text-xl text-ink">
          The Secret Seed Phrase Vault
        </h3>
        <p className="text-xs text-ink-soft">
          Inspect how a real 12-word seed phrase looks, and why sharing it instantly wipes your portfolio.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
            Sandbox
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Practice drills · Nothing costs money
          </span>
        </div>
      </div>

      {/* GLASSMORPHISM SEED PHRASE VAULT */}
      <Card data-tour="b3-seed-vault" className="relative overflow-hidden p-6 rounded-xl bg-surface border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-ink">
                Simulated 12-Word Recovery Phrase
              </h4>
              <span className="text-[10px] text-ink-soft">Master Seed Backup</span>
            </div>
          </div>

          <Badge variant="danger" className="text-[10px]">
            TOP SECRET
          </Badge>
        </div>

        {/* 12-Word Grid with Glassmorphism Overlay */}
        <div className="relative p-4 rounded-xl bg-surface/80 backdrop-blur-md border border-border">
          <div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 transition-all duration-300 ${!isRevealed ? 'filter blur-sm select-none opacity-40' : ''}`}>
            {sampleSeedWords.map((word, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-bg border border-border font-mono text-xs text-ink"
              >
                <span className="text-[10px] text-ink-soft mr-1">{idx + 1}.</span>
                <span className="font-medium">{word}</span>
              </div>
            ))}
          </div>

          {!isRevealed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/60 backdrop-blur-xs p-4 text-center">
              <Lock className="w-6 h-6 text-red-500 mb-1" />
              <span className="text-xs font-medium text-ink">Words are hidden for security</span>
              <span className="text-[11px] text-ink-soft mb-3">Click below to simulate revealing</span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRevealSeed}
                className="gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                <Eye className="w-3.5 h-3.5" /> Reveal Seed Phrase (Test Red Alert)
              </Button>
            </div>
          )}
        </div>

        {isRevealed && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-950 flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Golden Rule: </span>
              Write your real seed phrase down on physical paper or metal plate. Never screenshot it, never upload it to iCloud or Google Drive, and NEVER paste it into any website!
            </div>
          </div>
        )}
      </Card>

      {/* Official Wallet Install Hub */}
      <Card data-tour="b3-wallet-hub" className="p-4 bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-ink">
          <span className="flex items-center gap-1.5">
            <Download className="w-4 h-4 text-primary" />
            Official Wallet Extensions (Install Directly)
          </span>
          <Badge variant="outline" className="text-[10px]">Verified Direct</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <a
            href="https://phantom.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-bg border border-border hover:border-primary transition-all group"
          >
            <div className="font-medium text-ink group-hover:text-primary flex items-center justify-start gap-1">
              Phantom <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-[10px] text-ink-soft">Chrome / Brave</div>
          </a>

          <a
            href="https://solflare.com/download"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-bg border border-border hover:border-primary transition-all group"
          >
            <div className="font-medium text-ink group-hover:text-primary flex items-center justify-start gap-1">
              Solflare <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-[10px] text-ink-soft">Chrome / Firefox</div>
          </a>

          <a
            href="https://backpack.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-bg border border-border hover:border-primary transition-all group"
          >
            <div className="font-medium text-ink group-hover:text-primary flex items-center justify-start gap-1">
              Backpack <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-[10px] text-ink-soft">Web3 Native</div>
          </a>
        </div>
      </Card>

      {/* Phishing Detection Scenarios */}
      <div data-tour="b3-phishing-list" className="space-y-3">
        <h4 className="font-heading font-semibold text-sm text-ink">
          Spot The Phishing Scam (Test Your Reflexes)
        </h4>

        {scenarios.map((sc) => {
          const isSelected = selectedCase === sc.id;
          return (
            <Card
              key={sc.id}
              className={`p-4 space-y-3 cursor-pointer transition-all border ${
                isSelected ? 'border-primary ring-1 ring-primary/40' : 'border-border'
              }`}
              onClick={() => setSelectedCase(sc.id)}
            >
              <div className="flex justify-between items-start">
                <span className="font-heading font-semibold text-sm text-ink">{sc.title}</span>
                <span className="font-mono text-[10px] text-ink-soft bg-bg px-2 py-0.5 rounded border border-border">
                  {sc.url}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-bg border border-border text-xs font-mono text-ink">
                {sc.popup}
              </div>

              {isSelected && (
                <div
                  className={`p-3 rounded-xl text-xs space-y-1 flex items-start gap-2 animate-in fade-in duration-200 ${
                    sc.isScam
                      ? 'bg-danger-light text-red-900 border border-danger/30'
                      : 'bg-accent-light text-emerald-900 border border-accent/30'
                  }`}
                >
                  {sc.isScam ? (
                    <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-medium">
                      {sc.isScam ? 'DANGER: Malicious Scam! ' : 'SAFE: Legitimate Action! '}
                    </span>
                    {sc.explanation}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
