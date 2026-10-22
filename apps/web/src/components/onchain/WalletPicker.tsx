'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui';
import { Wallet, AlertTriangle } from 'lucide-react';

export interface WalletPickerProps {
  open: boolean;
  onClose: () => void;
}

function getInjectedWallets() {
  if (typeof window === 'undefined') return [];
  const win = window as any;
  const list: Array<{
    key: string;
    name: string;
    installed: boolean;
    solana: boolean;
    evm: boolean;
    installUrl: string;
    color: string;
  }> = [];

  const hasSol = (provider: any) => !!(provider?.isPhantom || provider?.isSolflare || provider?.isBackpack);
  const hasEvm = (provider: any) => !!(provider?.isMetaMask || provider?.isRabby || provider?.isOkxWallet || provider?.request);

  // Phantom can be both Solana and EVM
  if (win.phantom?.solana) {
    list.push({
      key: 'phantom',
      name: 'Phantom',
      installed: true,
      solana: win.phantom.solana.isPhantom !== false || hasSol(win.phantom.solana),
      evm: !!win.phantom.ethereum?.request,
      installUrl: 'https://phantom.app',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-600',
    });
  } else if (win.phantom?.ethereum) {
    list.push({
      key: 'phantom-evm',
      name: 'Phantom (EVM)',
      installed: true,
      solana: false,
      evm: true,
      installUrl: 'https://phantom.app',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-600',
    });
  }

  if (win.solflare) {
    list.push({
      key: 'solflare',
      name: 'Solflare',
      installed: true,
      solana: win.solflare.isSolflare !== false || hasSol(win.solflare),
      evm: !!win.solflare?.ethereum?.request,
      installUrl: 'https://solflare.com',
      color: 'bg-orange-500/10 border-orange-500/30 text-orange-600',
    });
  }

  if (win.backpack) {
    list.push({
      key: 'backpack',
      name: 'Backpack',
      installed: true,
      solana: true,
      evm: !!win.backpack?.ethereum?.request,
      installUrl: 'https://backpack.app',
      color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
    });
  }

  if (win.okxwallet) {
    list.push({
      key: 'okx',
      name: 'OKX Wallet',
      installed: true,
      solana: !!win.okxwallet?.solana?.request,
      evm: !!win.okxwallet?.request || !!win.okxwallet?.ethereum?.request,
      installUrl: 'https://www.okx.com/download',
      color: 'bg-black/5 border-black/30 text-ink',
    });
  }

  if (win.rabby) {
    list.push({
      key: 'rabby',
      name: 'Rabby',
      installed: true,
      solana: false,
      evm: true,
      installUrl: 'https://rabby.io',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
    });
  }

  if (win.ethereum && !win.ethereum.isPhantom && !win.ethereum.isRabby && !win.ethereum.isOkxWallet) {
    // MetaMask or another EVM wallet
    list.push({
      key: 'metamask',
      name: win.ethereum.isMetaMask ? 'MetaMask' : 'Browser Wallet (EVM)',
      installed: true,
      solana: false,
      evm: true,
      installUrl: 'https://metamask.io/download',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
    });
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return list.filter((w) => {
    if (seen.has(w.name)) return false;
    seen.add(w.name);
    return true;
  });
}

export function WalletPicker({ open, onClose }: WalletPickerProps) {
  const { select, wallets, connected } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [injected, setInjected] = useState<ReturnType<typeof getInjectedWallets>>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (open) setInjected(getInjectedWallets());
  }, [open]);

  if (!open) return null;

  // Wallet Standard adapters detected by the provider
  const walletStandard = wallets.filter(
    (w) =>
      w.adapter.name.toLowerCase().includes('phantom') ||
      w.adapter.name.toLowerCase().includes('solflare') ||
      w.adapter.name.toLowerCase().includes('backpack') ||
      w.adapter.name.toLowerCase().includes('okx')
  );

  const solWallets = [
    ...walletStandard.map((w) => {
      const name = w.adapter.name;
      const lower = name.toLowerCase();
      return {
        key: lower,
        name,
        installed: true,
        connect: () => {
          setIsConnecting(true);
          select(w.adapter.name);
          onClose();
        },
        installUrl:
          lower.includes('phantom')
            ? 'https://phantom.app'
            : lower.includes('solflare')
              ? 'https://solflare.com'
              : lower.includes('backpack')
                ? 'https://backpack.app'
                : 'https://www.okx.com/download',
        color: lower.includes('phantom')
          ? 'bg-purple-500/10 border-purple-500/30 text-purple-600'
          : lower.includes('solflare')
            ? 'bg-orange-500/10 border-orange-500/30 text-orange-600'
            : lower.includes('backpack')
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
              : 'bg-black/5 border-black/30 text-ink',
      };
    }),
    // Fallback for injected that might not be in wallet standard
    ...injected
      .filter((inj) => inj.solana && !walletStandard.some((ws) => ws.adapter.name.toLowerCase().includes(inj.key)))
      .map((inj) => ({
        key: inj.key,
        name: inj.name,
        installed: inj.installed,
        connect: async () => {
          setIsConnecting(true);
          try {
            const win = window as any;
            const prov = inj.key === 'phantom' ? win.phantom?.solana : inj.key === 'solflare' ? win.solflare : inj.key === 'okx' ? win.okxwallet?.solana : win[inj.key];
            if (prov?.connect) await prov.connect();
            // Let the adapter pick it up on next select
            const target = wallets.find((w) => w.adapter.name.toLowerCase().includes(inj.key === 'okx' ? 'okx' : inj.key));
            if (target) {
              select(target.adapter.name);
            }
          } catch (e) {
            console.warn('solana connect error', e);
          }
          onClose();
        },
        installUrl: inj.installUrl,
        color: inj.color,
      })),
  ];

  const evmWallets = injected.filter((inj) => inj.evm);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <h3 className="font-heading font-bold text-base text-ink flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent" />
            Connect Wallet
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
          Connect any wallet to pay on <strong>Solana</strong> or <strong>Base</strong>. For Solana
          Devnet, switch your wallet to Devnet/Testnet mode.
        </p>

        {solWallets.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Solana wallets
            </div>
            {solWallets.map((w) => (
              <div
                key={w.key}
                className="p-3 rounded-full border border-border hover:border-accent/50 hover:bg-accent/10 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${w.color} border flex items-center justify-center font-bold text-xs`}>
                    {w.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-ink">{w.name}</div>
                    <div className="text-[10px] text-ink-soft">Solana Devnet/Mainnet</div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs h-7 px-3"
                  isLoading={isConnecting && !connected}
                  onClick={w.connect}
                >
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}

        {evmWallets.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              EVM wallets (Base)
            </div>
            {evmWallets.map((w) => (
              <div
                key={w.key}
                className="p-3 rounded-full border border-border hover:border-accent/50 hover:bg-accent/10 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${w.color} border flex items-center justify-center font-bold text-xs`}>
                    {w.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-ink">{w.name}</div>
                    <div className="text-[10px] text-ink-soft">Base (8453)</div>
                  </div>
                </div>
                <span className="text-[10px] text-ink-soft px-2">Use in payment modal</span>
              </div>
            ))}
            <p className="text-[10px] text-ink-soft">
              MetaMask, OKX, Rabby, Phantom all work. Click "Connect EVM Wallet" in the payment modal on Base.
            </p>
          </div>
        )}

        {solWallets.length === 0 && evmWallets.length === 0 && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>No wallets detected.</strong> Install{' '}
                <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="underline">
                  Phantom
                </a>
                ,{' '}
                <a href="https://solflare.com" target="_blank" rel="noopener noreferrer" className="underline">
                  Solflare
                </a>
                ,{' '}
                <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline">
                  MetaMask
                </a>
                ,{' '}
                <a href="https://www.okx.com/download" target="_blank" rel="noopener noreferrer" className="underline">
                  OKX
                </a>{' '}
                or{' '}
                <a href="https://rabby.io" target="_blank" rel="noopener noreferrer" className="underline">
                  Rabby
                </a>{' '}
                and refresh.
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full text-left text-xs text-accent font-semibold hover:underline flex items-center justify-between py-1"
          >
            <span>How to switch wallet to Solana Devnet?</span>
            <span className="text-[10px]">{showGuide ? 'Hide' : 'Show steps'}</span>
          </button>

          {showGuide && (
            <div className="mt-2 p-3 rounded-xl bg-bg border border-border text-[11px] text-ink-soft space-y-2 animate-in fade-in duration-150">
              <div className="space-y-1">
                <strong className="text-ink block">In Solflare:</strong>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Open Solflare extension → Settings → Network → Devnet</li>
                </ol>
              </div>
              <div className="space-y-1 pt-1.5 border-t border-border">
                <strong className="text-ink block">In Phantom:</strong>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Open Phantom → Settings → Developer Settings → Testnet Mode ON</li>
                  <li>Select Solana Devnet</li>
                </ol>
              </div>
              <div className="space-y-1 pt-1.5 border-t border-border">
                <strong className="text-ink block">In OKX/Backpack:</strong>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Use the network selector to switch to Solana Devnet</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Tip:</strong> For Base payments use any EVM wallet (MetaMask, OKX, Rabby, Phantom). The
            same wallet can be linked to your Solana address so one payment unlocks both.
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

/** Standalone "Connect Wallet" button that opens the wallet picker. */
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
