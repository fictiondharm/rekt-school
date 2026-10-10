'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { HelpCircle, ChevronDown, ChevronUp, Repeat, Fuel, ExternalLink } from 'lucide-react';

interface StuckChecklistCardProps {
  className?: string;
}

export function StuckChecklistCard({ className }: StuckChecklistCardProps) {
  const [showStuck, setShowStuck] = useState(true);

  return (
    <Card className={`p-6 border-2 border-ink rounded-xl shadow-pop-lg ${className || ''}`}>
      <button
        type="button"
        onClick={() => setShowStuck((v) => !v)}
        className="w-full flex items-center justify-between text-xs font-bold text-ink"
      >
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-accent" /> Stuck? Quick Checklist
        </span>
        {showStuck ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showStuck && (
        <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs text-ink-soft">
          <div>1. Make sure your wallet is set to <strong>Solana Devnet</strong> (not Mainnet).</div>
          <div>2. Ensure you have free Devnet SOL from the <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline">official Solana faucet</a> for fees.</div>
          <div>3. If the transaction timed out, devnet may be busy. Retrying is completely safe.</div>
        </div>
      )}
    </Card>
  );
}

export function RaydiumSwapCard({ className }: StuckChecklistCardProps) {
  return (
    <Card className={`p-6 space-y-3 border-2 border-ink rounded-xl shadow-pop-lg ${className || ''}`}>
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600">
          <Repeat className="w-4 h-4" />
        </span>
        <h4 className="font-heading font-bold text-base text-ink">Want to explore swaps further?</h4>
      </div>

      <p className="text-xs text-ink-soft leading-relaxed">
        If the in-lesson AMM isn&apos;t working for you, or you want to see a production-grade DEX,
        head over to <strong>Raydium</strong> and try the same swap flow with real liquidity pools.
      </p>

      <a
        href="https://raydium.io/swap/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-accent text-white border-2 border-ink font-bold text-xs shadow-pop hover:shadow-pop-hover hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
      >
        <Repeat className="w-4 h-4" />
        <span>Open Raydium Swap</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <div className="p-3 rounded-lg bg-bg border border-border text-[11px] text-ink-soft flex items-start justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <Fuel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          Need more test SOL for fees? Grab it from the official faucet.
        </span>
        <a
          href="https://faucet.solana.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent font-bold hover:underline shrink-0 inline-flex items-center gap-0.5"
        >
          Claim SOL <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}
