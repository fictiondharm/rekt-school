'use client';

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { Card, Button, Badge } from '@/components/ui';
import {
  KeyRound,
  Shield,
  PenLine,
  CheckCircle2,
  Lock,
  ExternalLink,
  Download,
  AlertCircle,
  HelpCircle,
  Star,
} from 'lucide-react';
import { TourWrapper } from '@/components/tour/TourWrapper';

export function B2Companion() {
  const { publicKey, connected, sendTransaction, wallets, select, connect } = useWallet();
  const { connection } = useConnection();

  const [mounted, setMounted] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Send real zero-cost on-chain welcome message via Solana Memo Program
  const handleSignOnChainWelcome = async () => {
    if (!connected || !publicKey) {
      setErrorMsg('Please connect your wallet first.');
      return;
    }

    setIsSigning(true);
    setErrorMsg(null);
    setTxSignature(null);

    try {
      const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      const memoText = `Hello from Rekt School! Welcome, your on-chain journey begins here: ${publicKey.toBase58().slice(0, 8)}`;

      const tx = new Transaction();
      // Add Memo instruction
      tx.add(
        new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memoText, 'utf-8'),
        })
      );

      // Self-transfer 5000 lamports (gas) to ensure state registration
      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 5_000,
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
        throw new Error('Transaction confirmation failed on Devnet.');
      }

      setTxSignature(signature);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Signature rejected or insufficient devnet gas.');
    } finally {
      setIsSigning(false);
    }
  };

  const tourSteps = [
    {
      target: '[data-tour="wallet-install-options"]',
      title: 'Install a Real Web3 Wallet',
      text: 'Direct official extension links for Phantom, Solflare, and Backpack so you never risk searching fake Google ads.',
      side: 'bottom' as const,
    },
    {
      target: '[data-tour="public-address-box"]',
      title: 'Your Public Key',
      text: 'Your cryptographic identity. This is safe to share with anyone who wants to send you tokens.',
      side: 'top' as const,
    },
    {
      target: '[data-tour="welcome-sign-button"]',
      title: 'Sign On-Chain Welcome',
      text: 'Broadcast an immutable greeting to Solana Devnet via the Memo program for near-zero cost.',
      side: 'top' as const,
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <TourWrapper
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <Badge variant="primary" className="mb-1">
            ON-CHAIN LAB: B2
          </Badge>
          <h3 className="font-heading font-semibold text-xl text-ink">
            Connect & Initialize On-Chain Wallet
          </h3>
          <p className="text-xs text-ink-soft">
            Connect your real browser wallet and write your first zero-cost message to Solana Devnet.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsTourActive(true)}
          className="gap-1.5 text-xs self-start sm:self-center shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          Spotlight Tour
        </Button>
      </div>

      {/* Official Wallet Download Hub */}
      <Card data-tour="wallet-install-options" className="p-4 bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-ink">
          <span className="flex items-center gap-1.5">
            <Download className="w-4 h-4 text-primary" />
            Need a Wallet? Official Extension Downloads
          </span>
          <Badge variant="outline" className="text-[10px]">Official Links</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <a
            href="https://phantom.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-bg border border-border hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
          >
            <div className="font-medium text-ink group-hover:text-purple-700 flex items-center justify-start gap-1">
              Phantom <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-[10px] text-ink-soft mt-0.5">Most popular</div>
          </a>

          <a
            href="https://solflare.com/download"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-bg border border-border hover:border-orange-400 hover:bg-orange-50/50 transition-all group"
          >
            <div className="font-medium text-ink group-hover:text-orange-700 flex items-center justify-start gap-1">
              Solflare <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-[10px] text-ink-soft mt-0.5">Solana native</div>
          </a>

          <a
            href="https://backpack.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-bg border border-border hover:border-red-400 hover:bg-red-50/50 transition-all group"
          >
            <div className="font-medium text-ink group-hover:text-red-700 flex items-center justify-start gap-1">
              Backpack <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-[10px] text-ink-soft mt-0.5">Next-gen xNFT</div>
          </a>
        </div>
      </Card>

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        {/* Public Address Box */}
        <div data-tour="public-address-box" className="space-y-1.5 p-3.5 bg-bg rounded-xl border border-border">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-ink flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary" /> Public Address (Safe to share)
            </span>
            {mounted && connected ? (
              <Badge variant="accent" className="text-[10px]">
                Connected
              </Badge>
            ) : (
              <Badge variant="warn" className="text-[10px]">
                Not Connected
              </Badge>
            )}
          </div>
          <div className="font-mono text-xs text-primary font-semibold break-all">
            {mounted && connected && publicKey ? publicKey.toBase58() : 'Connect your wallet in the top bar to inspect'}
          </div>
        </div>

        {/* Private Key Box */}
        <div className="space-y-1.5 p-3.5 bg-danger-light/30 rounded-xl border border-danger/30">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-red-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-danger" /> Private Key (Never reveal)
            </span>
            <Badge variant="danger" className="text-[10px]">
              Secret
            </Badge>
          </div>
          <div className="font-mono text-xs text-red-800 tracking-widest">
            ••••••••••••••••••••••••••••••••••••••••••••••••
          </div>
          <p className="text-[10px] text-red-900/80">
            Locked inside your extension sandbox. DApps only ever receive signatures, never your private key.
          </p>
        </div>

        {/* Live On-Chain Memo Signer */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold text-ink">
            Action: Broadcast On-Chain Welcome Memo to Solana Devnet
          </div>
          <div className="p-3 rounded-lg bg-primary-light/30 text-xs font-mono text-ink">
            Memo Message: "Hello from Rekt School! Welcome, your on-chain journey begins here."
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div data-tour="welcome-sign-button">
            {connected ? (
              <Button
                variant="primary"
                onClick={handleSignOnChainWelcome}
                isLoading={isSigning}
                className="w-full gap-2 text-xs py-3"
              >
                <PenLine className="w-4 h-4" />
                {isSigning ? 'Signing in Extension...' : 'Sign & Broadcast Welcome to Solana Devnet'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={async () => {
                  if (wallets.length > 0) {
                    const chosen = wallets.find((w) => w.readyState === 'Installed') || wallets[0];
                    select(chosen.adapter.name);
                    try {
                      await connect();
                    } catch (err: any) {
                      setErrorMsg('Please click your wallet extension icon to approve connection.');
                    }
                  } else {
                    setErrorMsg('Please install Phantom, Solflare, or Backpack from the download links above.');
                  }
                }}
                className="w-full gap-2 text-xs py-3"
              >
                <KeyRound className="w-4 h-4" /> Connect Phantom or Solflare
              </Button>
            )}
          </div>

          {txSignature && (
            <div className="p-4 rounded-xl bg-accent-light border border-accent/40 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                On-Chain Welcome Verified on Solana Devnet!
              </div>
              <p className="text-xs text-emerald-950">
                Your greeting has been permanently recorded to the Solana ledger via the Memo Program.
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
        </div>

        <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-ink-soft">
          <Shield className="w-4 h-4 text-accent shrink-0" />
          <span>Non-custodial: Your private keys never touch our servers.</span>
        </div>
      </Card>
    </div>
  );
}
