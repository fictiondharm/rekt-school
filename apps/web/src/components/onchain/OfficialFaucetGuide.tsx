'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, Button, Badge } from '@/components/ui';
import { getSolanaConnection } from '@/lib/solana';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Coins,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export interface OfficialFaucetGuideProps {
  onSuccess?: () => void;
}

export function OfficialFaucetGuide({ onSuccess }: OfficialFaucetGuideProps) {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [airdropMessage, setAirdropMessage] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!publicKey) return;
    setIsChecking(true);
    try {
      const conn = getSolanaConnection();
      const lamports = await conn.getBalance(publicKey, 'confirmed');
      const sol = lamports / LAMPORTS_PER_SOL;
      setBalance(sol);
      if (sol > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.warn('Failed to fetch devnet balance:', err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      // Poll every 6 seconds to detect official faucet airdrops automatically
      const interval = setInterval(fetchBalance, 6000);
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  const handleCopyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectAirdropAttempt = async () => {
    if (!publicKey) return;
    setAirdropping(true);
    setAirdropMessage(null);
    try {
      const conn = getSolanaConnection();
      const sig = await conn.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
      const latestBlock = await conn.getLatestBlockhash();
      await conn.confirmTransaction({
        signature: sig,
        blockhash: latestBlock.blockhash,
        lastValidBlockHeight: latestBlock.lastValidBlockHeight,
      });
      setAirdropMessage('Direct airdrop succeeded!');
      await fetchBalance();
    } catch (err: any) {
      setAirdropMessage(
        'Devnet RPC rate limit hit. Please use the official faucet links below (recommended).'
      );
    } finally {
      setAirdropping(false);
    }
  };

  return (
    <Card className="p-6 bg-surface border-2 border-ink rounded-xl shadow-pop-lg space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="accent">GENUINE WEB3 ONBOARDING</Badge>
          <span className="text-xs font-mono text-ink-soft">Solana Devnet</span>
        </div>
        <h3 className="font-heading font-bold text-xl text-ink">
          Claim Real Testnet SOL from Official Faucets
        </h3>
        <p className="text-xs text-ink-soft">
          In real Web3 engineering, developers use official faucets to fund their test wallets. Learn the real workflow right here.
        </p>
      </div>

      {/* Wallet Status & Live Balance */}
      <div className="p-4 rounded-xl bg-bg border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">
            Your Devnet Wallet
          </span>
          {connected ? (
            <Badge variant="accent" className="text-xs gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              Connected
            </Badge>
          ) : (
            <Badge variant="warn" className="text-xs">
              Wallet Not Connected
            </Badge>
          )}
        </div>

        {connected && publicKey ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 p-2.5 bg-surface rounded-lg border border-border">
              <span className="font-mono text-xs text-ink truncate max-w-[220px] sm:max-w-xs">
                {publicKey.toBase58()}
              </span>
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1 text-xs text-accent font-semibold hover:text-accent-hover transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-ink-soft block">Live Devnet Balance:</span>
                <span className="font-mono font-semibold text-2xl text-ink">
                  {balance !== null ? `${balance.toFixed(4)} SOL` : 'Checking...'}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchBalance}
                disabled={isChecking}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-soft italic">
            Connect your Phantom or Solflare wallet in the top bar to inspect your balance.
          </p>
        )}
      </div>

      {/* Official Faucet Links Step */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center">
            1
          </span>
          <span className="font-heading font-bold text-sm text-ink">
            Official Faucet Portals (Instant & Unlimited)
          </span>
        </div>
        <p className="text-xs text-ink-soft leading-relaxed">
          Copy your public address above, open an official faucet portal in a new tab, paste your address, and request 1–2 SOL:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <a
            href="https://faucet.solana.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-accent/50 transition-all group"
          >
            <div>
              <div className="font-heading font-bold text-xs text-ink group-hover:text-accent transition-colors flex items-center gap-1.5">
                Official Solana Faucet
                <ExternalLink className="w-3 h-3 text-ink-soft" />
              </div>
              <div className="text-[10px] text-ink-soft">faucet.solana.com (Recommended)</div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-soft group-hover:text-accent transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href="https://faucet.quicknode.com/solana/devnet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-accent/50 transition-all group"
          >
            <div>
              <div className="font-heading font-bold text-xs text-ink group-hover:text-accent transition-colors flex items-center gap-1.5">
                QuickNode Devnet Faucet
                <ExternalLink className="w-3 h-3 text-ink-soft" />
              </div>
              <div className="text-[10px] text-ink-soft">High reliability multi-chain faucet</div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-soft group-hover:text-accent transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Direct RPC Airdrop Shortcut */}
      {connected && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-soft">Optional Quick Try:</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDirectAirdropAttempt}
              disabled={airdropping}
              className="gap-1.5 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              {airdropping ? 'Requesting...' : 'Request via Devnet RPC'}
            </Button>
          </div>
          {airdropMessage && (
            <p className="text-[11px] text-ink-soft flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {airdropMessage}
            </p>
          )}
        </div>
      )}

      {/* Completion Status */}
      {balance !== null && balance > 0 && (
        <div className="p-3.5 rounded-xl bg-accent/10 border border-accent flex items-center gap-2.5 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
          <div className="text-xs text-ink">
            <span className="font-bold">Devnet Wallet Ready! </span>
            You have {balance.toFixed(4)} SOL on Solana Devnet. You are fully equipped to sign real
            on-chain transactions.
          </div>
        </div>
      )}
    </Card>
  );
}
