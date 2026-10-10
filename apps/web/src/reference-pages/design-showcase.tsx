'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Callout,
  Slider,
  Disclaimer,
  Tooltip,
} from '@/components/ui';
import { Sparkles, Coins, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DesignShowcasePage() {
  const [sliderVal, setSliderVal] = useState(250);
  const [btnLoading, setBtnLoading] = useState(false);

  return (
    <div className="min-h-screen bg-bg p-8 max-w-5xl mx-auto space-y-10">
      <header className="border-b border-border pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-ink">
            Rekt School Design System
          </h1>
          <p className="text-ink-soft text-sm mt-1">
            Component showcase matching 04-UI-UX-DESIGN tokens (Light theme).
          </p>
        </div>
        <Badge variant="devnet">SOLANA DEVNET</Badge>
      </header>

      {/* Disclaimers */}
      <section className="space-y-3">
        <h2 className="text-xl font-heading font-bold text-ink">Disclaimers</h2>
        <Disclaimer />
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">Badges</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge variant="primary">Basic Tier</Badge>
          <Badge variant="accent">Completed</Badge>
          <Badge variant="warn">In Progress</Badge>
          <Badge variant="danger">High Risk</Badge>
          <Badge variant="info">Free Preview</Badge>
          <Badge variant="devnet">DEVNET ONLY</Badge>
          <Badge variant="outline">Unstarted</Badge>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">
            Start Lesson <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="secondary">Back</Button>
          <Button variant="accent">
            <Coins className="w-4 h-4 mr-1" /> Claim Devnet fUSDC
          </Button>
          <Button variant="danger">Reset Sim</Button>
          <Button variant="ghost">Skip Tour</Button>
          <Button
            variant="primary"
            isLoading={btnLoading}
            onClick={() => {
              setBtnLoading(true);
              setTimeout(() => setBtnLoading(false), 1500);
            }}
          >
            {btnLoading ? 'Verifying...' : 'Test Loading State'}
          </Button>
        </div>
      </section>

      {/* Callouts */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">Callouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Callout type="analogy" title="The Shared Piggy Bank">
            Think of a liquidity pool like a giant transparent piggy bank containing
            equal values of two tokens. When someone trades, they put one token in and take another out!
          </Callout>
          <Callout type="hint" title="Need a hint?">
            Try moving the trade slider to see how price impact escalates non-linearly.
          </Callout>
          <Callout type="warning" title="Seed Phrase Danger">
            Never ever share your 12-word seed phrase. Anyone with access to these words
            can drain your entire wallet instantly.
          </Callout>
          <Callout type="info" title="Devnet Money is Free">
            Every transaction on Rekt School uses test SOL and fake USDC on Solana Devnet.
            It costs zero real dollars.
          </Callout>
        </div>
      </section>

      {/* Sliders & Interactive Elements */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">Interactive Sliders</h2>
        <Card className="max-w-md">
          <Slider
            label="Simulated Swap Amount"
            value={sliderVal}
            min={10}
            max={1000}
            step={10}
            unit="fUSDC"
            onChange={setSliderVal}
            helperText="Drag to test price impact"
          />
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
            <span className="text-ink-soft">Current selection:</span>
            <span className="font-mono font-bold text-primary">{sliderVal} fUSDC</span>
          </div>
        </Card>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-ink">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="primary">Lesson B1</Badge>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="mt-2">Welcome to Rekt School</CardTitle>
              <CardDescription>
                A guided spotlight tour of how lessons, Aura, and practice panels work.
              </CardDescription>
            </CardHeader>
            <Button variant="secondary" className="w-full mt-2">
              Launch Tour
            </Button>
          </Card>

          <Card variant="interactive">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="info">Free Preview</Badge>
                <Coins className="w-5 h-5 text-accent" />
              </div>
              <CardTitle className="mt-2">I1: Liquidity Lab</CardTitle>
              <CardDescription>
                Experience the constant-product curve x·y=k with interactive depth toggles.
              </CardDescription>
            </CardHeader>
            <Button variant="accent" className="w-full mt-2">
              Explore Lab
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="accent">Verified</Badge>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="mt-2">Tooltips & Popovers</CardTitle>
              <CardDescription>
                Hover over terms like{' '}
                <Tooltip content="Automated Market Maker: a smart contract managing token trades.">
                  <span className="underline decoration-dotted decoration-primary font-semibold text-primary cursor-help">
                    AMM
                  </span>
                </Tooltip>{' '}
                to reveal instant 1-sentence explanations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
