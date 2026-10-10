'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button, Badge } from '@/components/ui';
import {
  Wallet,
  LogOut,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import bs58 from 'bs58';

export function WalletChip() {
  const { publicKey, connected, disconnect, select, wallets, signMessage } = useWallet();
  const { connection } = useConnection();

  // All state hooks declared unconditionally at the very top
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkedStatus, setLinkedStatus] = useState<string | null>(null);
  const [showDevnetGuide, setShowDevnetGuide] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

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

  // Clear the connecting spinner once the wallet reports as connected
  useEffect(() => {
    if (connected) setIsConnectingWallet(false);
  }, [connected]);

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

  const handleSelectWallet = (name: string, isInstalled: boolean, installUrl: string) => {
    if (!isInstalled) {
      window.open(installUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const target = wallets.find((w) =>
      w.adapter.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!target) return;

    setIsConnectingWallet(true);
    // Selecting the adapter triggers the provider's autoConnect flow, which
    // calls connect() on the freshly selected wallet after its event listeners
    // are attached, so the connected state propagates reliably to the UI.
    select(target.adapter.name);
    setIsOpen(false);
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

  // Check if wallet extensions are available: Wallet Standard adapters detected
  // by the provider, or an injected browser global (Phantom/Solflare).
  const hasWallet = (key: string) =>
    typeof window !== 'undefined' &&
    Boolean(
      wallets.some((w) => w.adapter.name.toLowerCase().includes(key)) ||
        (key === 'phantom' &&
          ((window as any).phantom?.solana?.isPhantom || (window as any).phantom?.ethereum)) ||
        (key === 'solflare' && (window as any).solflare?.isSolflare)
    );

  const isSolflareInstalled = hasWallet('solflare');
  const isPhantomInstalled = hasWallet('phantom');

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
    <><Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setIsConnectingWallet(false);
          setIsOpen(true);
        }}
        className="gap-1.5 text-xs font-semibold h-9 px-3 rounded-full border-2 border-ink"
      ><Wallet className="w-3.5 h-3.5 text-accent" /><span className="hidden sm:inline">Connect</span> Wallet
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        ><div
            className="bg-surface rounded-xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          ><div className="flex justify-between items-center pb-2 border-b border-border"><h3 className="font-heading font-bold text-base text-ink flex items-center gap-2"><Wallet className="w-4 h-4 text-accent" />
                Select Devnet Wallet
              </h3><button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-ink-soft hover:text-ink font-semibold"
              >
                Close
              </button></div><p className="text-xs text-ink-soft leading-relaxed">
              Connect a Web3 browser extension switched to <strong>Solana Devnet</strong>. If you don't have one installed, click to install in 1 click!
            </p><div className="space-y-2.5">
              {/* Solflare Wallet Item */}
              <div className="p-3 rounded-full border border-border hover:border-accent/50 hover:bg-accent/10 flex items-center justify-between text-xs transition-colors"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-600 font-bold text-xs">
                    S
                  </div><div><div className="font-bold text-ink">Solflare Wallet</div><div className="text-[10px] text-ink-soft">
                      {isSolflareInstalled ? 'Extension detected' : 'Not installed in browser'}
                    </div></div></div>

                {isSolflareInstalled ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs h-7 px-3"
                    isLoading={isConnectingWallet}
                    onClick={() => handleSelectWallet('solflare', true, 'https://solflare.com')}
                  >
                    Connect
                  </Button>
                ) : (
                  <a
                    href="https://solflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500 text-white font-bold text-[11px] hover:bg-orange-600 transition-colors shadow-xs"
                  ><span>Install Solflare</span><ExternalLink className="w-3 h-3" /></a>
                )}
              </div>

              {/* Phantom Wallet Item */}
              <div className="p-3 rounded-full border border-border hover:border-accent/50 hover:bg-accent/10 flex items-center justify-between text-xs transition-colors"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 font-bold text-xs">
                    P
                  </div><div><div className="font-bold text-ink">Phantom Wallet</div><div className="text-[10px] text-ink-soft">
                      {isPhantomInstalled ? 'Extension detected' : 'Not installed in browser'}
                    </div></div></div>

                {isPhantomInstalled ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs h-7 px-3"
                    isLoading={isConnectingWallet}
                    onClick={() => handleSelectWallet('phantom', true, 'https://phantom.app')}
                  >
                    Connect
                  </Button>
                ) : (
                  <a
                    href="https://phantom.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition-colors shadow-xs"
                  ><span>Install Phantom</span><ExternalLink className="w-3 h-3" /></a>
                )}
              </div>
            </div>

            {/* Devnet Network Switch Instructions */}
            <div className="pt-2 border-t border-border"><button
                type="button"
                onClick={() => setShowDevnetGuide(!showDevnetGuide)}
                className="w-full text-left text-xs text-accent font-semibold hover:underline flex items-center justify-between py-1"
              ><span> How to switch wallet to Solana Devnet?</span><span className="text-[10px]">{showDevnetGuide ? 'Hide' : 'Show steps'}</span></button>

              {showDevnetGuide && (
                <div className="mt-2 p-3 rounded-xl bg-bg border border-border text-[11px] text-ink-soft space-y-2 animate-in fade-in duration-150"><div className="space-y-1"><strong className="text-ink block">In Solflare:</strong><ol className="list-decimal pl-4 space-y-0.5"><li>Open Solflare extension</li><li>Click the <strong>Settings (gear icon)</strong> at bottom right</li><li>Click <strong>Network</strong> &gt; Select <strong>Devnet</strong></li></ol></div><div className="space-y-1 pt-1.5 border-t border-border"><strong className="text-ink block">In Phantom:</strong><ol className="list-decimal pl-4 space-y-0.5"><li>Open Phantom extension</li><li>Click the <strong>Settings (gear icon)</strong></li><li>Click <strong>Developer Settings</strong> &gt; toggle <strong>Testnet Mode ON</strong></li><li>Select <strong>Solana Devnet</strong></li></ol></div></div>
              )}
            </div><div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><div><strong>Important:</strong> All lessons run on <strong>Solana Devnet</strong>. Never test with real Mainnet SOL!
              </div></div></div></div>
      )}
    </>
  );
}
