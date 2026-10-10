'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { Coins, Database, Layers, HelpCircle, RotateCcw } from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function B5Companion() {
  const [tokenAmount, setTokenAmount] = useState(25.5);
  const [isTourActive, setIsTourActive] = useState(false);
  const decimals = 6;
  const integerUnits = Math.round(tokenAmount * Math.pow(10, decimals));

  const tourSteps = [
    {
      target: '[data-tour="b5-controls"]',
      title: 'Human-Readable Balance',
      text: 'Drag this slider to set a friendly decimal balance like 25.5 fUSDC, and watch what the blockchain actually stores underneath.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="b5-mint"]',
      title: 'The Mint Account',
      text: 'This is the master recipe for the token. It defines the total supply, the decimals, and who is allowed to mint more.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="b5-ata"]',
      title: 'Your Token Account (ATA)',
      text: 'Your wallet does not hold the token directly. It owns this separate child account. The big number at the bottom is the exact integer the chain stores.',
      side: 'top' as const,
    },
  ];

  const handleReset = () => {
    setTokenAmount(25.5);
  };

  return (
    <div className="w-full max-w-lg space-y-5">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="devnet" className="mb-1">
            SOLANA DEVNET · B5
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
          SPL Token & Decimals Explorer
        </h3>
        <p className="text-xs text-ink-soft">
          See how user-facing decimal balances convert into on-chain integer units.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
            Solana Devnet
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            No real wallet · Nothing costs money
          </span>
        </div>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <div data-tour="b5-controls">
          <Slider
            label="Human-Readable Balance (fUSDC)"
            value={tokenAmount}
            min={1}
            max={100}
            step={0.5}
            unit="fUSDC"
            onChange={setTokenAmount}
          />
        </div>

        <div className="space-y-3 pt-2">
          {/* Mint Account Box */}
          <div data-tour="b5-mint" className="p-3.5 rounded-xl bg-bg border border-border space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-ink flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-primary" /> Token Mint: fUSDC
              </span>
              <span className="font-mono text-[10px] text-ink-soft">6 Decimals</span>
            </div>
            <div className="text-xs font-mono text-ink-soft truncate">
              Mint ID: FUSDCL7k...9mQ2
            </div>
          </div>

          {/* ATA Box */}
          <div data-tour="b5-ata" className="p-3.5 rounded-xl bg-primary-light/30 border border-primary/20 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-primary flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> Your Associated Token Account (ATA)
              </span>
              <Badge variant="accent" className="text-[10px]">
                Active
              </Badge>
            </div>
            <div className="text-xs font-mono text-ink truncate">
              Address: ATA_8xZb...4kNp
            </div>
            <div className="pt-2 border-t border-primary/20 flex justify-between items-center text-xs">
              <span className="text-ink-soft">Actual on-chain integer stored:</span>
              <span className="font-mono font-semibold text-primary text-sm">
                {integerUnits.toLocaleString()} units
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
