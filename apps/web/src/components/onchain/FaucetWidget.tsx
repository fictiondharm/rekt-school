'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Fuel,
  Coins,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { COURSE_PROGRAM_IDS } from '@/lib/solana';

export function FaucetWidget() {
  const { publicKey, connected } = useWallet();
  const [gasLoading, setGasLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'gas' | 'token'; message: string; sig?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copiedCA, setCopiedCA] = useState(false);
  const [showImportGuide, setShowImportGuide] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeWallet = mounted && publicKey ? publicKey.toBase58() : 'Devn4wKQyL7xMop8Z21T9v';
  const fusdcCA = COURSE_PROGRAM_IDS.FUSDC_MINT;

  const handleCopyCA = () => {
    navigator.clipboard.writeText(fusdcCA);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  const handleClaimGas = async () => {
    setGasLoading(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch('/api/faucet/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: activeWallet }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'gas', message: data.message, sig: data.signature });
      } else {
        setError(data.message);
      }
    } catch {
      setError('Network error requesting devnet gas.');
    } finally {
      setGasLoading(false);
    }
  };

  const handleClaimToken = async () => {
    setTokenLoading(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch('/api/faucet/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: activeWallet, amount: 10000 }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({
          type: 'token',
          message: data.message || 'Successfully minted 10,000 fUSDC to your token account!',
          sig: data.signature,
        });
      } else {
        setError(data.message);
      }
    } catch {
      setError('Network error claiming test tokens.');
    } finally {
      setTokenLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 border border-border shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-heading font-semibold text-base text-ink">
            Solana Devnet Faucet Station
          </h3>
          <p className="text-[11px] text-ink-soft">
            Targeting: <span className="font-mono font-bold text-primary">{connected ? `${activeWallet.slice(0, 4)}...${activeWallet.slice(-4)}` : 'Instant Demo Wallet'}</span>
          </p>
        </div>
        <Badge variant="devnet" className="text-[10px]">
          FREE DEVNET FUNDS
        </Badge>
      </div>

      <p className="text-xs text-ink-soft leading-relaxed">
        Claim free Devnet SOL for network fees and <strong>10,000 fUSDC</strong> to test AMM swaps and liquidity pools:
      </p>

      {/* Claim Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          onClick={handleClaimGas}
          isLoading={gasLoading}
          className="gap-2 text-xs h-10"
        >
          <Fuel className="w-4 h-4 text-amber-500" /> +0.5 Devnet SOL
        </Button>

        <Button
          variant="primary"
          onClick={handleClaimToken}
          isLoading={tokenLoading}
          className="gap-2 text-xs h-10 shadow-sm"
        >
          <Coins className="w-4 h-4 text-white" /> +10,000 fUSDC
        </Button>
      </div>

      {/* Contract Address (CA) Card */}
      <div className="p-3.5 rounded-xl bg-bg border border-border space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-ink flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-primary" /> fUSDC Contract Address (CA)
          </span>
          <button
            type="button"
            onClick={handleCopyCA}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
          >
            {copiedCA ? (
              <>
                <Check className="w-3 h-3 text-accent" />
                <span className="text-accent">Copied CA!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy CA</span>
              </>
            )}
          </button>
        </div>

        <div className="font-mono text-[11px] text-ink break-all bg-surface p-2 rounded-lg border border-border select-all">
          {fusdcCA}
        </div>

        {/* Toggle Step-by-Step Add to Wallet Guide */}
        <button
          type="button"
          onClick={() => setShowImportGuide(!showImportGuide)}
          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 pt-1"
        >
          <HelpCircle className="w-3 h-3" />
          <span>{showImportGuide ? 'Hide instructions' : 'How to add fUSDC to your Phantom / Solflare wallet?'}</span>
        </button>

        {showImportGuide && (
          <div className="mt-2 p-3 rounded-lg bg-surface border border-border text-[11px] text-ink-soft space-y-2 animate-in fade-in duration-150">
            <p className="font-bold text-ink">To see your 10,000 fUSDC in your wallet extension:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Click <strong>Copy CA</strong> above to copy the token mint address.</li>
              <li>Open your <strong>Phantom</strong> or <strong>Solflare</strong> extension.</li>
              <li>Scroll to the bottom of your token list and click <strong>Manage token list</strong> (or the <strong>+</strong> button).</li>
              <li>Paste the Contract Address into the search bar.</li>
              <li>Enable / Import <strong>fUSDC</strong>. Your 10,000 balance will now display!</li>
            </ol>
          </div>
        )}
      </div>

      {status && (
        <div className="p-3.5 rounded-xl bg-accent-light border border-accent/40 space-y-1.5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            {status.message}
          </div>
          {status.sig && (
            <div className="text-[11px] font-mono text-emerald-800 flex justify-between items-center">
              <span>Receipt: {status.sig.slice(0, 18)}...</span>
              <a
                href={`https://explorer.solana.com/tx/${status.sig}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-danger-light border border-danger/30 text-xs text-red-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
    </Card>
  );
}
