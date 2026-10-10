'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Card, Button, Badge } from '@/components/ui';
import { OfficialFaucetGuide } from '@/components/onchain/OfficialFaucetGuide';
import { Fuel, RefreshCw, CheckCircle2, ExternalLink, Zap, AlertCircle } from 'lucide-react';

export function B4Companion() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [actualFeePaid, setActualFeePaid] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      const lamports = await connection.getBalance(publicKey, 'confirmed');
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.warn('Failed to fetch balance:', err);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    }
  }, [connected, publicKey]);

  const handleSendLiveTx = async () => {
    if (!publicKey || !connected) {
      setErrorMsg('Please connect your wallet first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setTxSignature(null);

    try {
      // Create real Solana Devnet micro-transfer (sending 0.0001 SOL to user's own address)
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Self-transfer to demonstrate fee burning safely without losing principal
          lamports: 10_000, // 0.00001 SOL
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
        throw new Error('Transaction failed on devnet.');
      }

      setTxSignature(signature);

      // Fetch confirmed transaction to extract real exact fee paid
      const confirmedTx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (confirmedTx?.meta?.fee) {
        setActualFeePaid(confirmedTx.meta.fee / LAMPORTS_PER_SOL);
      } else {
        setActualFeePaid(0.000005);
      }

      await fetchBalance();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Transaction was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      <div className="space-y-1">
        <Badge variant="primary" className="mb-1">
          LIVE ON-CHAIN LAB: B4
        </Badge>
        <h3 className="font-heading font-semibold text-xl text-ink">
          Real Devnet Gas & Execution Fee
        </h3>
        <p className="text-xs text-ink-soft">
          Broadcast a live self-transfer transaction on Solana Devnet to measure exact lamport gas fees.
        </p>
      </div>

      {/* If wallet has 0 balance, provide official faucet guide right here */}
      {mounted && (!connected || balance === 0) && (
        <OfficialFaucetGuide onSuccess={fetchBalance} />
      )}

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        {/* Balance & Fee Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-bg rounded-xl border border-border">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">
              Live Devnet Balance
            </span>
            <span className="font-mono font-semibold text-lg text-primary">
              {balance !== null ? `${balance.toFixed(5)} SOL` : 'Connect Wallet'}
            </span>
          </div>

          <div className="p-3 bg-bg rounded-xl border border-border">
            <span className="text-[10px] font-medium uppercase text-ink-soft block">
              Standard Solana Fee
            </span>
            <span className="font-mono font-semibold text-lg text-accent">
              5,000 Lamports
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2.5 rounded-lg bg-bg border border-border">
            <span className="text-ink-soft">Network:</span>
            <span className="font-mono font-semibold text-ink">Solana Devnet</span>
          </div>
          <div className="flex justify-between items-center p-2.5 rounded-lg bg-bg border border-border">
            <span className="text-ink-soft">Execution Mechanism:</span>
            <span className="font-mono font-semibold text-ink">
              SystemProgram.transfer (Self-loop)
            </span>
          </div>
          <div className="flex justify-between items-center p-2.5 rounded-lg bg-bg border border-border">
            <span className="text-ink-soft">Solana Fee Burning:</span>
            <span className="font-mono font-semibold text-ink">
              50% burned, 50% paid to validator
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
          variant="primary"
          onClick={handleSendLiveTx}
          disabled={loading || !connected || (balance !== null && balance <= 0.0001)}
          className="w-full gap-2 text-xs py-3"
        >
          <Fuel className="w-4 h-4" />
          {loading
            ? 'Signing & Confirming on Devnet...'
            : !connected
            ? 'Connect Wallet to Sign'
            : balance !== null && balance <= 0.0001
            ? 'Claim Devnet SOL from Faucet Above First'
            : 'Sign & Broadcast Live Devnet Transaction'}
        </Button>

        {/* Real Confirmed Explorer Card */}
        {txSignature && (
          <div className="p-4 rounded-xl bg-accent-light/50 border border-accent/40 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-heading font-semibold text-sm text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-accent" /> Live On-Chain Transaction Confirmed!
            </div>
            <p className="text-xs text-emerald-900">
              Actual network fee deducted:{' '}
              <span className="font-mono font-semibold">
                {actualFeePaid ? `${actualFeePaid.toFixed(6)} SOL` : '0.000005 SOL'}
              </span>{' '}
              (~${((actualFeePaid || 0.000005) * 150).toFixed(6)} USD).
            </p>
            <div className="pt-2 border-t border-accent/30 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-ink-soft truncate max-w-[200px]">
                Tx: {txSignature}
              </span>
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
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
