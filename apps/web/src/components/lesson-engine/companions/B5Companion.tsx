'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Slider } from '@/components/ui';
import { Coins, Database, Layers } from 'lucide-react';

export function B5Companion() {
  const [tokenAmount, setTokenAmount] = useState(25.5);
  const decimals = 6;
  const integerUnits = Math.round(tokenAmount * Math.pow(10, decimals));

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <Badge variant="primary" className="mb-1">
          INTERACTIVE LAB: B5
        </Badge>
        <h3 className="font-heading font-semibold text-xl text-ink">
          SPL Token & Decimals Explorer
        </h3>
        <p className="text-xs text-ink-soft">
          See how user-facing decimal balances convert into on-chain integer units.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <Slider
          label="Human-Readable Balance (fUSDC)"
          value={tokenAmount}
          min={1}
          max={100}
          step={0.5}
          unit="fUSDC"
          onChange={setTokenAmount}
        />

        <div className="space-y-3 pt-2">
          {/* Mint Account Box */}
          <div className="p-3.5 rounded-xl bg-bg border border-border space-y-1">
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
          <div className="p-3.5 rounded-xl bg-primary-light/30 border border-primary/20 space-y-2">
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
