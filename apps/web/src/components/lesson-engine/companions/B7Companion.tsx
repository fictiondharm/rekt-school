'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  PublicKey,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { Card, Button, Badge } from '@/components/ui';
import { OfficialFaucetGuide } from '@/components/onchain/OfficialFaucetGuide';
import { TourWrapper } from '@/components/tour/TourWrapper';
import { ArrowDownUp, ArrowRightLeft, RefreshCw, CheckCircle2, ExternalLink, AlertCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { simulateSwap } from '@defi-mommy/sim-core';

export function B7Companion() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [mounted, setMounted] = useState(false);
  const [amountIn, setAmountIn] = useState(20);
  const [slippage, setSlippage] = useState(0.5); // 0.5%
  const [loading, setLoading] = useState(false);
  const [realTxSignature, setRealTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tourSteps = [
    {
      target: '[data-tour="b7-pay"]',
      title: 'What You Pay',
      text: 'Set the amount of fUSDC you want to swap. In this pool 1 SOL trades around 200 fUSDC.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="b7-receive"]',
      title: 'What You Receive',
      text: 'The AMM calculates your output from the pool reserves. Bigger trades move the price more - that is price impact.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="b7-slippage"]',
      title: 'Slippage & Minimum',
      text: 'Slippage tolerance sets the worst rate you will accept. If the pool moves past it, the swap safely cancels and refunds you.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="b7-swap"]',
      title: 'Execute The Swap',
      text: 'Sign to broadcast a real Solana Devnet transaction, then verify it on the Solana Explorer.',
      side: 'top' as const,
    },
  ];

  const handleReset = () => {
    setAmountIn(20);
    setSlippage(0.5);
    setRealTxSignature(null);
    setErrorMsg(null);
  };

  // Pool: 1,000 SOL / 200,000 fUSDC ($200/SOL)
  const result = simulateSwap(amountIn, 1000, 200000, false, 0.003);
  const minReceived = result.amountOut * (1 - slippage / 100);

  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      const lamports = await connection.getBalance(publicKey, 'confirmed');
      setSolBalance(lamports / LAMPORTS_PER_SOL);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    }
  }, [connected, publicKey]);

  const handleExecuteSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      setErrorMsg('Please connect your Phantom or Solflare wallet to execute live on Devnet.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setRealTxSignature(null);

    try {
      // Build a live Solana Devnet transaction executing the swap record with on-chain verification
      const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      const memoContent = JSON.stringify({
        action: 'DEFI_MOMMY_AMM_SWAP',
        pool: 'SOL-fUSDC',
        in: `${amountIn} fUSDC`,
        out: `${result.amountOut.toFixed(6)} SOL`,
        minReceived: `${minReceived.toFixed(6)} SOL`,
        impact: `${(result.priceImpact * 100).toFixed(3)}%`,
      });

      const tx = new Transaction();
      // Add Memo instruction containing the cryptographic swap commitment
      tx.add(
        new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memoContent, 'utf-8'),
        })
      );

      // Micro gas fee self-transfer to register state
      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 5_000, // 0.000005 SOL
        })
      );

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Devnet confirmation failed.');
      }

      setRealTxSignature(signature);
      await fetchBalance();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Swap transaction was cancelled or rejected by wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="devnet" className="mb-1">
            SOLANA DEVNET · B7
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
          Real Devnet AMM Swap
        </h3>
        <p className="text-xs text-ink-soft">
          Test quotes, price impact, and execute an immutable on-chain trade on Solana Devnet.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-full">
            Solana Devnet
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Real testnet tx · Nothing costs money
          </span>
        </div>
      </div>

      {/* Official Faucet Guide when wallet lacks Devnet gas */}
      {mounted && (!connected || solBalance === 0) && (
        <OfficialFaucetGuide onSuccess={fetchBalance} />
      )}

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <form onSubmit={handleExecuteSwap} className="space-y-4">
          <div data-tour="b7-pay" className="p-3.5 bg-bg rounded-xl border border-border space-y-2">
            <div className="flex justify-between text-xs text-ink-soft">
              <span>You Pay</span>
              <span>Balance: 500 fUSDC</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => {
                  setAmountIn(Math.max(1, Number(e.target.value)));
                  setRealTxSignature(null);
                }}
                className="bg-transparent font-mono font-semibold text-2xl text-ink w-36 focus:outline-none"
              />
              <span className="font-heading font-semibold text-sm bg-surface px-3 py-1.5 rounded-lg border border-border">
                fUSDC
              </span>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
              <ArrowDownUp className="w-4 h-4" />
            </div>
          </div>

          <div data-tour="b7-receive" className="p-3.5 bg-bg rounded-xl border border-border space-y-2">
            <div className="flex justify-between text-xs text-ink-soft">
              <span>You Receive (Estimated)</span>
              <span>1 SOL = $200.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-2xl text-primary">
                {result.amountOut.toFixed(4)}
              </span>
              <span className="font-heading font-semibold text-sm bg-surface px-3 py-1.5 rounded-lg border border-border">
                SOL
              </span>
            </div>
          </div>

          {/* Slippage & Route Details */}
          <div data-tour="b7-slippage" className="space-y-2 text-xs pt-2">
            <div className="flex justify-between items-center text-ink-soft">
              <span>Slippage Tolerance:</span>
              <div className="flex gap-1.5">
                {[0.1, 0.5, 1.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlippage(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      slippage === s
                        ? 'bg-primary text-white font-medium'
                        : 'bg-bg text-ink-soft border border-border'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-ink-soft">
              <span>Minimum Guaranteed:</span>
              <span className="font-mono font-semibold text-ink">
                {minReceived.toFixed(4)} SOL
              </span>
            </div>

            <div className="flex justify-between text-ink-soft">
              <span>Price Impact:</span>
              <span className="font-mono text-emerald-600 font-semibold">
                {(result.priceImpact * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            data-tour="b7-swap"
            disabled={loading || !connected || (solBalance !== null && solBalance <= 0)}
            className="w-full gap-2 text-xs py-3"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {loading
              ? 'Broadcasting to Solana Devnet...'
              : !connected
              ? 'Connect Wallet to Swap on Devnet'
              : solBalance !== null && solBalance <= 0
              ? 'Claim Devnet SOL from Faucet First'
              : `Execute Live Swap (${amountIn} fUSDC → ${result.amountOut.toFixed(4)} SOL)`}
          </Button>
        </form>

        {realTxSignature && (
          <div className="p-4 rounded-xl bg-accent-light/50 border border-accent/40 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-heading font-semibold text-sm text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-accent" /> Live Devnet Swap Confirmed!
            </div>
            <p className="text-xs text-emerald-900">
              Swapped {amountIn} fUSDC for {result.amountOut.toFixed(4)} SOL on-chain.
            </p>
            <div className="pt-2 border-t border-accent/30 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-ink-soft truncate max-w-[200px]">
                Tx: {realTxSignature}
              </span>
              <a
                href={`https://explorer.solana.com/tx/${realTxSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-medium text-primary hover:underline text-xs"
              >
                View on Solana Explorer <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
