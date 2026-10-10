'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { calculateInitialLP, calculateSubsequentLP, getPoolShare } from '@defi-mommy/sim-core';
import { TourWrapper } from '@/components/tour/TourWrapper';
import {
  PlusCircle,
  CheckCircle2,
  Layers,
  Coins,
  Zap,
  Check,
  Info,
  ExternalLink,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

export function I2Companion() {
  const [depositSol, setDepositSol] = useState(5);
  const [depositUsdc, setDepositUsdc] = useState(1000);
  const [deposited, setDeposited] = useState(false);
  const [accumulatedFeesUsd, setAccumulatedFeesUsd] = useState(0);
  const [simulatedTradesCount, setSimulatedTradesCount] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  const tourSteps = [
    {
      target: '[data-tour="i2-lab-header"]',
      title: 'Welcome to the LP Lab',
      text: 'This right-hand panel is your liquidity provider sandbox. Everything you read in the lesson, you can prove here by withdrawing real numbers instead of trusting our word.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i2-deposit-inputs"]',
      title: 'Deposit Equal Values',
      text: 'These two boxes are the tokens you feed the pool: SOL on the left, fUSDC on the right. LPs always deposit EQUAL dollar values (this pool prices SOL at $200), because a pool is a balanced scale.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="i2-lp-receipt"]',
      title: 'Your LP Token Receipt',
      text: 'The moment you deposit, the contract mints you LP tokens - the top line. The bottom line is the payoff: the exact % of every 0.3% swap fee this pool generates that now belongs to you.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="i2-deposit-button"]',
      title: 'Pull the Trigger',
      text: 'Hit Deposit to mint your LP tokens. Then simulate market trades below, watch your unclaimed fees grow, and claim them. That growing number IS the LP yield engine in the lesson, made real.',
      side: 'top' as const,
    },
  ];

  // Pool state: 1,000 SOL and 200,000 USDC, total LP supply = 14,142
  const reserveSol = 1000;
  const reserveUsdc = 200000;
  const totalLPSupply = 14142;

  const mintedLP = calculateSubsequentLP(
    depositSol,
    depositUsdc,
    reserveSol,
    reserveUsdc,
    totalLPSupply
  );
  const poolShare = getPoolShare(mintedLP, totalLPSupply + mintedLP);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeposited(true);
    setClaimed(false);
  };

  const handleSimulateTrades = (count: number) => {
    // Each trade adds fee volume proportional to pool share
    const tradeVolume = count * 2500; // $2,500 average volume per trade
    const feeEarned = tradeVolume * 0.003 * poolShare; // 0.3% fee * user's share
    setAccumulatedFeesUsd((prev) => prev + feeEarned);
    setSimulatedTradesCount((prev) => prev + count);
  };

  const handleClaimFees = () => {
    if (accumulatedFeesUsd <= 0) return;
    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false);
      setClaimed(true);
      setAccumulatedFeesUsd(0);
    }, 800);
  };

  const handleReset = () => {
    setDepositSol(5);
    setDepositUsdc(1000);
    setDeposited(false);
    setAccumulatedFeesUsd(0);
    setSimulatedTradesCount(0);
    setClaimed(false);
    setIsClaiming(false);
  };

  return (
    <div className="w-full max-w-lg space-y-5">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div data-tour="i2-lab-header" className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="mb-1">
            LAB I2 • LIQUIDITY PROVISION
          </Badge>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTourActive(true)}
              className="gap-1.5 text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent" /> Tour
            </Button>
            <Button
              data-tour="i2-reset"
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
          Deposit Liquidity & Earn On-Chain Fees
        </h3>
        <p className="text-xs text-ink-soft">
          Deposit balanced pairs into the AMM, receive proportional LP tokens, and harvest trading fees.
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

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <form onSubmit={handleDeposit} className="space-y-4 text-xs">
          <div data-tour="i2-deposit-inputs" className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-heading font-semibold text-ink block mb-1">
                Deposit SOL
              </label>
              <input
                type="number"
                value={depositSol}
                onChange={(e) => {
                  setDepositSol(Number(e.target.value));
                  setDeposited(false);
                }}
                className="w-full p-2.5 rounded-button bg-bg border border-border font-mono text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-heading font-semibold text-ink block mb-1">
                Deposit fUSDC ($200/SOL)
              </label>
              <input
                type="number"
                value={depositUsdc}
                onChange={(e) => {
                  setDepositUsdc(Number(e.target.value));
                  setDeposited(false);
                }}
                className="w-full p-2.5 rounded-button bg-bg border border-border font-mono text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>
          </div>

          <div data-tour="i2-lp-receipt" className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between items-center text-ink-soft">
              <span>LP Tokens You Receive:</span>
              <span className="font-mono font-semibold text-primary text-sm">
                {mintedLP.toFixed(2)} LP Tokens
              </span>
            </div>
            <div className="flex justify-between items-center text-ink-soft">
              <span>Your Share of All Pool Trading Fees:</span>
              <span className="font-mono font-semibold text-emerald-600">
                {(poolShare * 100).toFixed(3)}%
              </span>
            </div>
          </div>

          <div data-tour="i2-deposit-button">
            <Button type="submit" variant="primary" className="w-full gap-2 text-xs py-2.5 shadow-sm">
              <PlusCircle className="w-4 h-4" /> Deposit Liquidity into Pool
            </Button>
          </div>
        </form>

        {deposited && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-accent-light border border-accent/40 space-y-2">
              <div className="flex items-center gap-2 font-heading font-semibold text-sm text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-accent" /> Liquidity Active!
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                You hold {mintedLP.toFixed(2)} LP tokens. You now automatically earn {(poolShare * 100).toFixed(3)}% of every 0.3% swap fee executed in this pool!
              </p>
            </div>

            {/* Simulate Swaps to generate fees */}
            <div className="p-4 rounded-xl bg-bg border border-border space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Simulate Market Trading
                </span>
                <span className="font-mono text-ink-soft text-[11px]">{simulatedTradesCount} Trades Run</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSimulateTrades(10)}
                  className="text-xs"
                >
                  +10 Market Trades
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSimulateTrades(50)}
                  className="text-xs text-primary border-primary/30"
                >
                  +50 Arbitrage Swaps
                </Button>
              </div>

              {/* Accumulated Fees Card & Claim Button */}
              <div className="p-3 bg-surface rounded-lg border border-border flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-ink-soft uppercase font-medium block">
                    Your Unclaimed Fees:
                  </span>
                  <span className="font-mono font-semibold text-emerald-600 text-sm">
                    ${accumulatedFeesUsd.toFixed(3)} USD
                  </span>
                </div>

                <Button
                  variant="accent"
                  size="sm"
                  disabled={accumulatedFeesUsd <= 0 || isClaiming}
                  isLoading={isClaiming}
                  onClick={handleClaimFees}
                  className="gap-1 text-xs"
                >
                  <Coins className="w-3.5 h-3.5" /> Claim Fees
                </Button>
              </div>

              {claimed && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Fees claimed! (Simulated — no real wallet involved.)</span>
                </div>
              )}
            </div>

            {/* Reality Check Note */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-amber-900">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Real-World Note: LP Tokens on Solana</span>
              </div>
              <p className="leading-relaxed">
                In actual protocols like Raydium or Orca, LP tokens are authentic SPL tokens held in your wallet. When you want to withdraw your original deposits and collected fees, you burn your LP tokens back to the smart contract pool.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* What Just Happened? */}
      {deposited && (
        <Card className="p-4 bg-surface border-2 border-ink rounded-xl shadow-pop-lg flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-heading font-bold text-ink">What Just Happened?</h4>
            <p className="text-ink-soft leading-relaxed">
              {claimed
                ? 'You claimed your accumulated fees back to your balance. Your LP position stays active and immediately starts earning again - LP tokens are a rolling ownership receipt, not a one-time payout.'
                : simulatedTradesCount > 0
                ? `You deposited ${depositSol} SOL + $${depositUsdc.toLocaleString()} and ${simulatedTradesCount} simulated trades ran through the pool. Your share multiplied that volume into $${accumulatedFeesUsd.toFixed(3)} of unclaimed fees - ownership %, multiplied by fee %, multiplied by volume.`
                : `You deposited ${depositSol} SOL + $${depositUsdc.toLocaleString()} and minted ${mintedLP.toFixed(2)} LP tokens - your slice of the pool. You now earn ${(poolShare * 100).toFixed(3)}% of every 0.3% swap fee the pool collects.`}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
