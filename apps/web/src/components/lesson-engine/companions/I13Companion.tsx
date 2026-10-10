'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Coins,
  Flame,
  ExternalLink,
  PieChart,
  Layers,
  Terminal,
  RefreshCw,
} from 'lucide-react';

interface MockTokenAudit {
  id: string;
  name: string;
  ticker: string;
  mintAddress: string;
  isMintRevoked: boolean;
  isFreezeRevoked: boolean;
  top10SharePct: number;
  lpBurnedPct: number;
  poolSharePct: number;
  retailSharePct: number;
  safetyScore: number;
  verdict: 'safe' | 'caution' | 'danger';
  notes: string;
}

const PRESET_AUDITS: MockTokenAudit[] = [
  {
    id: 'clean',
    name: 'SolShield Community Token',
    ticker: 'SHLD',
    mintAddress: 'SHLDxP8mB2wK4...j9qV',
    isMintRevoked: true,
    isFreezeRevoked: true,
    top10SharePct: 12.5,
    lpBurnedPct: 100,
    poolSharePct: 48.0,
    retailSharePct: 39.5,
    safetyScore: 98,
    verdict: 'safe',
    notes: 'Exemplary on-chain structure. Both authorities permanently burned to null. Top 10 non-pool holders own only 12.5% combined, and 100% of Raydium LP tokens are sent to incinerator address.',
  },
  {
    id: 'honeypot',
    name: 'YieldMax Moon',
    ticker: 'YMOON',
    mintAddress: 'Moon7kP2...9aZ3',
    isMintRevoked: true,
    isFreezeRevoked: false,
    top10SharePct: 62.0,
    lpBurnedPct: 0,
    poolSharePct: 15.0,
    retailSharePct: 23.0,
    safetyScore: 14,
    verdict: 'danger',
    notes: 'CRITICAL HONEYPOT: Freeze authority is active under deployer key! Creator can freeze buyer accounts at any moment. Furthermore, 0% of LP is burned, allowing an instant rugpull.',
  },
  {
    id: 'printer',
    name: 'SuperFarm Gold',
    ticker: 'SFARM',
    mintAddress: 'Farm9bC...4dE1',
    isMintRevoked: false,
    isFreezeRevoked: true,
    top10SharePct: 44.0,
    lpBurnedPct: 35,
    poolSharePct: 22.0,
    retailSharePct: 34.0,
    safetyScore: 28,
    verdict: 'danger',
    notes: 'UNLIMITED MINT RISK: Mint authority is still held by creator. Even though freeze authority is revoked, deployer can silently mint billions of new tokens and sell into DEX liquidity.',
  },
];

export function I13Companion() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();

  const [selectedAuditId, setSelectedAuditId] = useState<string>('clean');
  const [customMintInput, setCustomMintInput] = useState<string>('');
  const [isQueryingOnChain, setIsQueryingOnChain] = useState<boolean>(false);
  const [onChainResult, setOnChainResult] = useState<{
    mintAddress: string;
    supply: string;
    isMintRevoked: boolean;
    isFreezeRevoked: boolean;
    decimals: number;
  } | null>(null);
  const [rpcError, setRpcError] = useState<string | null>(null);

  const activeAudit = PRESET_AUDITS.find((a) => a.id === selectedAuditId) || PRESET_AUDITS[0];

  const handleLiveRpcQuery = async () => {
    if (!customMintInput.trim()) return;
    setIsQueryingOnChain(true);
    setRpcError(null);
    setOnChainResult(null);

    try {
      const pubkey = new PublicKey(customMintInput.trim());
      const mintInfo = await getMint(connection, pubkey);

      setOnChainResult({
        mintAddress: pubkey.toBase58(),
        supply: (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toLocaleString(),
        isMintRevoked: mintInfo.mintAuthority === null,
        isFreezeRevoked: mintInfo.freezeAuthority === null,
        decimals: mintInfo.decimals,
      });
    } catch (err: any) {
      setRpcError(err.message || 'Failed to fetch mint data from the sandbox RPC.');
    } finally {
      setIsQueryingOnChain(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 border border-border shadow-card bg-surface text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-xl text-ink">On-Chain Token Inspector</h2>
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Audit Solana SPL token mint accounts, verify authority renouncements, and calculate holder concentration.
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

        <Badge
          variant={activeAudit.verdict === 'safe' ? 'accent' : 'danger'}
          className="text-xs font-mono font-bold px-3 py-1 self-start sm:self-auto"
        >
          {activeAudit.safetyScore} / 100 Safety Rating
        </Badge>
      </div>

      {/* Preset Token Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {PRESET_AUDITS.map((audit) => {
          const isSelected = selectedAuditId === audit.id;
          return (
            <button
              key={audit.id}
              onClick={() => {
                setSelectedAuditId(audit.id);
                setOnChainResult(null);
                setRpcError(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary-light/50 font-medium shadow-xs'
                  : 'border-border bg-surface-raised hover:bg-bg'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink">{audit.name}</span>
                <span className="font-mono text-[10px] text-ink-soft">({audit.ticker})</span>
              </div>
              <div className="text-[10px] text-ink-soft truncate mt-1">
                {audit.verdict === 'safe' ? 'Renounced & Burned' : 'Critical Vulnerability'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Authority Status & Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Mint Authority Card */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            activeAudit.isMintRevoked
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-rose-500/20 bg-rose-500/5'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {activeAudit.isMintRevoked ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-ink">Mint Authority Status</div>
            <div className="text-xs font-mono font-semibold">
              {activeAudit.isMintRevoked ? (
                <span className="text-emerald-700">None (Hard-Capped Supply)</span>
              ) : (
                <span className="text-rose-700">Active (Unlimited Inflation Risk)</span>
              )}
            </div>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              {activeAudit.isMintRevoked
                ? 'No one can ever print new tokens. Total supply cannot be diluted.'
                : 'Deployer can secretly mint trillions of new tokens and dump onto DEXes.'}
            </p>
          </div>
        </div>

        {/* Freeze Authority Card */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            activeAudit.isFreezeRevoked
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-rose-500/20 bg-rose-500/5'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {activeAudit.isFreezeRevoked ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-ink">Freeze Authority Status</div>
            <div className="text-xs font-mono font-semibold">
              {activeAudit.isFreezeRevoked ? (
                <span className="text-emerald-700">None (Unfreezable)</span>
              ) : (
                <span className="text-rose-700">Active (Honeypot Exploit Risk)</span>
              )}
            </div>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              {activeAudit.isFreezeRevoked
                ? 'Your wallet can never be blacklisted or frozen from selling.'
                : 'Authority key can freeze token accounts, preventing buyers from selling.'}
            </p>
          </div>
        </div>
      </div>

      {/* Holder Distribution & LP Lock Gauge */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-4">
        <div className="flex items-center justify-between text-xs font-medium text-ink">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-primary" />
            <span>Supply Allocation & Liquidity Lockup Breakdown</span>
          </div>
          <span className="text-[10px] font-mono text-ink-soft">100% Total Supply</span>
        </div>

        {/* Visual Distribution Bar */}
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded-full bg-border overflow-hidden flex">
            <div
              style={{ width: `${activeAudit.poolSharePct}%` }}
              className="bg-primary hover:opacity-90 transition-all"
              title={`DEX Liquidity Pool: ${activeAudit.poolSharePct}%`}
            />
            <div
              style={{ width: `${activeAudit.retailSharePct}%` }}
              className="bg-emerald-500 hover:opacity-90 transition-all"
              title={`Public / Retail Holders: ${activeAudit.retailSharePct}%`}
            />
            <div
              style={{ width: `${activeAudit.top10SharePct}%` }}
              className={activeAudit.top10SharePct > 35 ? 'bg-rose-500' : 'bg-amber-500'}
              title={`Top 10 Insiders: ${activeAudit.top10SharePct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-soft pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span>DEX Pool: {activeAudit.poolSharePct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Public: {activeAudit.retailSharePct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  activeAudit.top10SharePct > 35 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
              />
              <span>Top 10 Insiders: {activeAudit.top10SharePct}%</span>
            </div>
          </div>
        </div>

        {/* LP Lock status */}
        <div className="p-3 rounded-lg bg-bg border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-ink font-medium">Raydium LP Token Status:</span>
          </div>
          <span className="font-mono font-semibold">
            {activeAudit.lpBurnedPct === 100 ? (
              <span className="text-emerald-700">100% Burned to Incinerator</span>
            ) : (
              <span className="text-rose-700">
                {activeAudit.lpBurnedPct}% Burned ({100 - activeAudit.lpBurnedPct}% Unlocked in Deployer Wallet)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Live Read-Only RPC Query (Sandbox) */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary-light/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-ink flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Live Read-Only RPC Query · Sandbox (Try Any Mint Address)</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Read-only · No wallet
          </Badge>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste SPL Mint Address (e.g. 4zMMC... for USDC)"
            value={customMintInput}
            onChange={(e) => setCustomMintInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-surface text-ink font-mono focus:outline-hidden focus:border-primary"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleLiveRpcQuery}
            disabled={isQueryingOnChain || !customMintInput.trim()}
            isLoading={isQueryingOnChain}
            className="text-xs font-medium shrink-0"
          >
            <Search className="w-3.5 h-3.5 mr-1" />
            <span>Verify RPC</span>
          </Button>
        </div>

        {rpcError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700">
            {rpcError}
          </div>
        )}

        {onChainResult && (
          <div className="p-3 rounded-lg bg-surface border border-emerald-500/30 space-y-2 text-xs font-mono animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-emerald-800 font-medium">
              <span>Verified On-Chain Mint Data</span>
              <span>Decimals: {onChainResult.decimals}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-soft">
              <div>Total Supply: {onChainResult.supply}</div>
              <div>Mint Revoked: {onChainResult.isMintRevoked ? 'YES' : 'NO'}</div>
              <div>Freeze Revoked: {onChainResult.isFreezeRevoked ? 'YES' : 'NO'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Scout Audit Conclusion */}
      <div className="p-3.5 rounded-xl bg-bg border border-border space-y-1 text-xs">
        <div className="font-medium text-ink">Scout Audit Summary:</div>
        <p className="text-ink-soft leading-relaxed">{activeAudit.notes}</p>
      </div>
    </Card>
  );
}
