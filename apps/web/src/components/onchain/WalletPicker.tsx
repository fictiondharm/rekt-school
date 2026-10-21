'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui';
import { Wallet, AlertTriangle, ExternalLink } from 'lucide-react';

export interface WalletPickerProps {
  open: boolean;
  onClose: () => void;
}

export function WalletPicker({ open, onClose }: WalletPickerProps) {
  const { select, wallets } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDevnetGuide, setShowDevnetGuide] = useState(false);

  if (!open) return null;

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

  const handleSelectWallet = (name: string, isInstalled: boolean, installUrl: string) => {
    if (!isInstalled) {
      window.open(installUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const target = wallets.find((w) =>
      w.adapter.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!target) return;

    setIsConnecting(true);
    // Selecting the adapter triggers the provider's autoConnect flow, which
    // calls connect() on the freshly selected wallet after its event listeners
    // are attached, so the connected state propagates reliably to the UI.
    select(target.adapter.name);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <h3 className="font-heading font-bold text-base text-ink flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent" />
            Select Devnet Wallet
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-ink-soft hover:text-ink font-semibold"
          >
            Close
          </button>
        </div>
        <p className="text-xs text-ink-soft leading-relaxed">
          Connect a Web3 browser extension switched to <strong>Solana Devnet</strong>. If you
          don't have one installed, click to install in 1 click!
        </p>
        <div className="space-y-2.5">
          {/* Solflare Wallet Item */}
          <div className="p-3 rounded-full border border-border hover:border-accent/50 hover:bg-accent/10 flex items-center justify-between text-xs transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-600 font-bold text-xs">
                S
              </div>
              <div>
                <div className="font-bold text-ink">Solflare Wallet</div>
                <div className="text-[10px] text-ink-soft">
                  {isSolflareInstalled ? 'Extension detected' : 'Not installed in browser'}
                </div>
              </div>
            </div>

            {isSolflareInstalled ? (
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-7 px-3"
                isLoading={isConnecting}
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
              >
                <span>Install Solflare</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Phantom Wallet Item */}
          <div className="p-3 rounded-full border border-border hover:border-accent/50 hover:bg-accent/10 flex items-center justify-between text-xs transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 font-bold text-xs">
                P
              </div>
              <div>
                <div className="font-bold text-ink">Phantom Wallet</div>
                <div className="text-[10px] text-ink-soft">
                  {isPhantomInstalled ? 'Extension detected' : 'Not installed in browser'}
                </div>
              </div>
            </div>

            {isPhantomInstalled ? (
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-7 px-3"
                isLoading={isConnecting}
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
              >
                <span>Install Phantom</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Devnet Network Switch Instructions */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowDevnetGuide(!showDevnetGuide)}
            className="w-full text-left text-xs text-accent font-semibold hover:underline flex items-center justify-between py-1"
          >
            <span> How to switch wallet to Solana Devnet?</span>
            <span className="text-[10px]">{showDevnetGuide ? 'Hide' : 'Show steps'}</span>
          </button>

          {showDevnetGuide && (
            <div className="mt-2 p-3 rounded-xl bg-bg border border-border text-[11px] text-ink-soft space-y-2 animate-in fade-in duration-150">
              <div className="space-y-1">
                <strong className="text-ink block">In Solflare:</strong>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Open Solflare extension</li>
                  <li>
                    Click the <strong>Settings (gear icon)</strong> at bottom right
                  </li>
                  <li>
                    Click <strong>Network</strong> &gt; Select <strong>Devnet</strong>
                  </li>
                </ol>
              </div>
              <div className="space-y-1 pt-1.5 border-t border-border">
                <strong className="text-ink block">In Phantom:</strong>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Open Phantom extension</li>
                  <li>
                    Click the <strong>Settings (gear icon)</strong>
                  </li>
                  <li>
                    Click <strong>Developer Settings</strong> &gt; toggle{' '}
                    <strong>Testnet Mode ON</strong>
                  </li>
                  <li>
                    Select <strong>Solana Devnet</strong>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Important:</strong> All lessons run on <strong>Solana Devnet</strong>. Never
            test with real Mainnet SOL!
          </div>
        </div>
      </div>
    </div>
  );
}

export interface WalletConnectButtonProps {
  label?: string;
  className?: string;
}

/** Standalone "Connect Wallet" button that opens the Solana wallet picker. */
export function WalletConnectButton({
  label = 'Connect Wallet',
  className = '',
}: WalletConnectButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className={`gap-1.5 text-xs font-semibold h-9 px-3 rounded-full border-2 border-ink ${className}`}
      >
        <Wallet className="w-3.5 h-3.5 text-accent" />
        {label}
      </Button>
      <WalletPicker open={open} onClose={() => setOpen(false)} />
    </>
  );
}
