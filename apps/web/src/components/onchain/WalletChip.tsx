'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button, Badge } from '@/components/ui';
import {
  Wallet,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import bs58 from 'bs58';
import { WalletPicker } from './WalletPicker';

export function WalletChip() {
  const { publicKey, connected, disconnect, signMessage } = useWallet();
  const { connection } = useConnection();

  // All state hooks declared unconditionally at the very top
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkedStatus, setLinkedStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const address = publicKey?.toBase58();
  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : null;

  // Fetch the real devnet balance for the connected wallet
  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    connection
      .getBalance(publicKey)
      .then((lamports) => {
        if (!cancelled) setBalance(lamports / LAMPORTS_PER_SOL);
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  const handleSelectWallet = () => undefined;

  // Safe base58 helper that works in both CJS and ESM environments
  const encodeSignature = (bytes: Uint8Array): string => {
    try {
      if (typeof (bs58 as any).encode === 'function') {
        return (bs58 as any).encode(bytes);
      }
      if ((bs58 as any).default && typeof (bs58 as any).default.encode === 'function') {
        return (bs58 as any).default.encode(bytes);
      }
    } catch (e) {
      console.warn('Base58 encode fallback:', e);
    }
    // Fallback hex if base58 is unavailable
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleLinkWallet = async () => {
    if (!publicKey || !signMessage) return;
    setIsLinking(true);
    setLinkedStatus(null);

    try {
      // 1. Get nonce from server
      const nonceRes = await fetch('/api/wallet/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: publicKey.toBase58() }),
      });
      const { nonce, message } = await nonceRes.json();

      // 2. Request user to sign challenge in wallet
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signatureBase58 = encodeSignature(signatureBytes);

      // 3. Verify on server
      const linkRes = await fetch('/api/wallet/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: publicKey.toBase58(),
          signature: signatureBase58,
          nonce,
        }),
      });
      const result = await linkRes.json();

      if (result.success) {
        setLinkedStatus('Wallet linked and verified on server!');
      } else {
        setLinkedStatus(result.message || 'Verification failed.');
      }
    } catch (err: unknown) {
      console.warn('Wallet linking cancelled or failed:', err);
      setLinkedStatus('Signing cancelled by user.');
    } finally {
      setIsLinking(false);
    }
  };

  // SSR protection to prevent React hydration mismatch before client mount
  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="gap-1.5 text-xs font-semibold h-9 px-3 opacity-90 rounded-full border-2 border-ink"
      ><Wallet className="w-3.5 h-3.5 text-accent" /><span className="hidden sm:inline">Connect</span> Wallet
      </Button>
    );
  }

  // If connected, render the connected wallet chip & dropdown
  if (connected && shortAddress) {
    return (
      <div className="relative"><button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border hover:border-accent/50 text-xs font-semibold text-ink shadow-xs transition-colors"
        ><div className="w-2 h-2 rounded-full bg-accent animate-pulse" /><span className="font-mono">{shortAddress}</span>
          {balance !== null && (
            <span className="text-accent font-mono bg-accent/10 px-1.5 py-0.5 rounded text-[11px]">
              {balance.toFixed(2)} SOL
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-ink-soft opacity-60" /></button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-surface rounded-xl border border-border shadow-xl p-4 z-50 space-y-3 animate-in fade-in duration-150"><div className="flex justify-between items-center pb-2 border-b border-border"><span className="text-xs font-bold font-heading text-ink">Connected Wallet</span><Badge variant="devnet" className="text-[10px]">
                DEVNET
              </Badge></div><div className="space-y-1"><span className="text-[10px] text-ink-soft uppercase font-bold tracking-wider">
                Full Address
              </span><div className="font-mono text-xs text-ink break-all bg-bg p-2 rounded-lg border border-border">
                {address}
              </div></div>

            {/* Link Wallet Action */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleLinkWallet}
              isLoading={isLinking}
              className="w-full text-xs gap-1.5"
            ><ShieldCheck className="w-3.5 h-3.5" /> Link & Sign Challenge
            </Button>

            {linkedStatus && (
              <div className="p-2 rounded bg-accent/10 text-accent text-[11px] font-semibold text-center">
                {linkedStatus}
              </div>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="w-full text-xs gap-1.5"
            ><LogOut className="w-3.5 h-3.5" /> Disconnect
            </Button></div>
        )}
      </div>
    );
  }


  // Disconnected state
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsPickerOpen(true)}
        className="gap-1.5 text-xs font-semibold h-9 px-3 rounded-full border-2 border-ink"
      ><Wallet className="w-3.5 h-3.5 text-accent" /><span className="hidden sm:inline">Connect</span> Wallet
      </Button>

      <WalletPicker open={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
    </>
  );
}