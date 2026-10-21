'use client';

import React, { useState, useEffect } from 'react';
import { Button, Badge } from '@/components/ui';
import { DollarSign, CheckCircle2, ShieldCheck, Copy } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { createPublicClient, http, parseUnits, parseEther, type Address } from 'viem';
import { base } from 'viem/chains';
import { BASE_USDC, BASE_TREASURY } from '@/lib/base';
import { UNLOCK_PRICE_USD, UNLOCK_USDC_AMOUNT, UNLOCK_USDC_BASE_UNITS } from '@/lib/pricing';
import { setCourseUnlocked } from '@/lib/unlock';

const USDC_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

type Chain = 'solana-mainnet' | 'solana-devnet' | 'base';
type Asset = 'USDC' | 'SOL' | 'ETH';

const CHAIN_ASSETS: Record<Chain, Asset[]> = {
  'solana-mainnet': ['USDC', 'SOL'],
  'solana-devnet': ['SOL'],
  base: ['USDC', 'ETH'],
};

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [chain, setChain] = useState<Chain>('solana-mainnet');
  const [asset, setAsset] = useState<Asset>('USDC');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'confirming' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [evmAddress, setEvmAddress] = useState<Address | null>(null);
  const [evmChainId, setEvmChainId] = useState<number | null>(null);

  const { publicKey, sendTransaction, connected: solanaConnected } = useWallet();

  // Phantom exposes an EVM provider too (window.phantom.ethereum). Fall back to
  // it when no standard window.ethereum is injected so Base payments work.
  const getEvmProvider = () =>
    (typeof window !== 'undefined' &&
      ((window as any).ethereum || (window as any).phantom?.ethereum)) ||
    null;

  const baseClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'),
  });

  const connectEvm = async () => {
    const provider = getEvmProvider();
    if (!provider) {
      setError('No EVM wallet found. Install MetaMask or Phantom.');
      return;
    }
    try {
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      setEvmAddress(accounts[0] as Address);
      const chainId: string = await provider.request({ method: 'eth_chainId' });
      setEvmChainId(parseInt(chainId, 16));
    } catch (err: any) {
      setError(err?.message || 'Wallet connection failed.');
    }
  };

  useEffect(() => {
    const provider = getEvmProvider();
    if (provider) {
      provider.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts[0]) {
          setEvmAddress(accounts[0] as Address);
          provider.request({ method: 'eth_chainId' }).then((chainId: string) => {
            setEvmChainId(parseInt(chainId, 16));
          });
        }
      });
      provider.on('accountsChanged', (accounts: string[]) => {
        setEvmAddress(accounts[0] as Address || null);
      });
    }
  }, []);

  if (!isOpen) return null;

  const isSolana = chain !== 'base';
  const walletConnected = isSolana ? solanaConnected : !!evmAddress;
  const walletAddress = isSolana ? publicKey?.toBase58() : evmAddress;
  const needsAmount = asset === 'SOL' || asset === 'ETH';

  const handleChainChange = (c: Chain) => {
    setChain(c);
    setAsset(CHAIN_ASSETS[c][0]);
    setStatus('idle');
    setError(null);
  };

  const handleSolanaPay = async () => {
    if (!publicKey || !sendTransaction) return;
    setStatus('pending');
    setError(null);

    try {
      const rpc = chain === 'solana-devnet'
          ? (process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com')
          : (process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com');
      const conn = new Connection(rpc, 'confirmed');
      const treasury = new PublicKey('HtKPeixUAG5a28rxn4weDqyNfwb8BwSmEp7y7xfZHTf5');
      const tx = new Transaction();

      if (asset === 'USDC') {
        const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
        const fromATA = await getAssociatedTokenAddress(usdcMint, publicKey);
        const toATA = await getAssociatedTokenAddress(usdcMint, treasury);
        tx.add(createTransferInstruction(fromATA, toATA, publicKey, UNLOCK_USDC_BASE_UNITS));
      } else {
        const solAmount = parseFloat(amount);
        if (isNaN(solAmount) || solAmount <= 0) {
          setStatus('error');
          setError('Enter a valid SOL amount.');
          return;
        }
        tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: treasury, lamports: Math.round(solAmount * LAMPORTS_PER_SOL) }));
      }

      const { blockhash } = await conn.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signed = await sendTransaction(tx, conn);
      await conn.confirmTransaction(signed, 'confirmed');
      await verifyAndUnlock(chain, signed, publicKey.toBase58());
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'Transaction failed.');
    }
  };

  const handleBasePay = async () => {
    if (!evmAddress) return;
    setStatus('pending');
    setError(null);

    try {
      const provider = getEvmProvider();
      if (!provider) {
        setStatus('error');
        setError('No EVM wallet found. Install MetaMask.');
        return;
      }

      let txHash: `0x${string}`;

      if (asset === 'USDC') {
        txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: evmAddress,
            to: BASE_USDC,
            data: encodeUsdcTransfer(BASE_TREASURY, parseUnits(UNLOCK_USDC_AMOUNT, 6)),
          }],
        });
      } else {
        const ethAmount = parseFloat(amount);
        if (isNaN(ethAmount) || ethAmount <= 0) {
          setStatus('error');
          setError('Enter a valid ETH amount.');
          return;
        }
        txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: evmAddress,
            to: BASE_TREASURY,
            value: `0x${parseEther(ethAmount.toString()).toString(16)}`,
          }],
        });
      }

      await verifyAndUnlock('base', txHash, evmAddress);
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'Transaction failed.');
    }
  };

  const verifyAndUnlock = async (chainName: string, txHash: string, wallet: string) => {
    setStatus('confirming');
    setError(null);

    try {
      const res = await fetch('/api/payments/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain: chainName, txHash, wallet, asset }),
      });
      const data = await res.json();

      if (data.success) {
        setCode(data.code);
        setStatus('done');
        setCourseUnlocked();
        onSuccess();
      } else {
        setStatus('error');
        setError(data.message || 'Verification failed.');
      }
    } catch {
      setStatus('error');
      setError('Network error. Try again.');
    }
  };

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePay = () => {
    if (isSolana) handleSolanaPay();
    else handleBasePay();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-xl border-2 border-ink p-6 sm:p-8 max-w-md w-full shadow-pop-lg space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start pb-2 border-b border-border">
          <div>
            <Badge variant="accent" className="text-[10px] mb-1">EARLY ACCESS</Badge>
            <h3 className="font-heading font-bold text-xl text-ink">
              Unlock All Lessons for ${UNLOCK_PRICE_USD.toFixed(2)}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-xs font-semibold text-ink-soft hover:text-ink">Close</button>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1 bg-bg rounded-lg">
          {(['solana-mainnet', 'solana-devnet', 'base'] as Chain[]).map((c) => (
            <button key={c} type="button" onClick={() => handleChainChange(c)} className={`py-2 text-[11px] font-bold font-heading rounded-full transition-colors ${chain === c ? 'bg-accent text-white border-2 border-ink shadow-pop-sm' : 'bg-white text-ink-soft border-2 border-border'}`}>
              {c === 'solana-mainnet' ? 'Solana' : c === 'solana-devnet' ? 'Devnet' : 'Base'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-bg rounded-lg">
          {CHAIN_ASSETS[chain].map((a) => (
            <button key={a} type="button" onClick={() => { setAsset(a); setStatus('idle'); setError(null); }} className={`py-2 text-[11px] font-bold font-heading rounded-full transition-colors ${asset === a ? 'bg-tertiary text-ink border-2 border-ink shadow-pop-sm' : 'bg-white text-ink-soft border-2 border-border'}`}>
              {a}
            </button>
          ))}
        </div>

        {status === 'done' && code ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-quaternary/15 border-2 border-quaternary space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-quaternary mx-auto" />
              <p className="font-heading font-bold text-ink">Payment Confirmed!</p>
              <p className="text-xs text-ink-soft">Your invite code:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="font-mono font-bold text-lg text-ink bg-white px-4 py-2 rounded-lg border-2 border-ink">{code}</code>
                <button type="button" onClick={handleCopy} className="p-2 rounded-lg border-2 border-ink bg-tertiary hover:shadow-pop-sm transition-all">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <p className="text-[11px] text-quaternary font-bold">Copied!</p>}
            </div>
            <Button variant="primary" onClick={onClose} className="w-full">Start Learning</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-soft">Asset:</span>
                <span className="font-mono font-bold text-ink">{asset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Network:</span>
                <span className="font-mono text-ink">{chain === 'solana-mainnet' ? 'Solana Mainnet' : chain === 'solana-devnet' ? 'Solana Devnet' : 'Base'}</span>
              </div>
              {asset === 'USDC' && (
                <div className="flex justify-between">
                  <span className="text-ink-soft">Amount:</span>
                  <span className="font-mono font-bold text-accent text-sm">
                    {UNLOCK_USDC_AMOUNT} USDC
                  </span>
                </div>
              )}
              {needsAmount && (
                <div className="pt-1 border-t border-accent/20">
                  <label className="text-ink-soft text-[11px] font-bold uppercase tracking-wide">Amount ({asset})</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={asset === 'SOL' ? '0.005' : '0.0003'}
                    className="mt-1 w-full px-3 py-2 text-sm font-mono bg-white rounded-lg border-2 border-border focus:border-accent focus:outline-none"
                  />
                  <p className="text-[11px] text-ink-faint mt-1">
                    Must be worth at least ${UNLOCK_PRICE_USD.toFixed(2)} USD
                  </p>
                </div>
              )}
            </div>

            {!walletConnected ? (
              <div className="p-3 rounded-xl bg-tertiary/20 border border-tertiary text-xs text-center space-y-2">
                <p className="font-bold text-ink mb-1">Connect your wallet first</p>
                {!isSolana && (
                  <Button variant="secondary" onClick={connectEvm} className="w-full text-xs">
                    Connect EVM Wallet
                  </Button>
                )}
                {isSolana && <p className="text-ink-soft">Use the Connect Wallet button in the top bar.</p>}
              </div>
            ) : (
              <>
                {!isSolana && evmChainId !== 8453 && (
                  <div className="p-3 rounded-xl bg-tertiary/20 border border-tertiary text-xs text-center space-y-2">
                    <p className="font-bold text-ink">Switch to Base network in your wallet</p>
                    <Button variant="secondary" className="w-full text-xs" onClick={async () => {
                      const provider = getEvmProvider();
                      if (provider) {
                        try {
                          await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }] });
                        } catch {
                          setError('Please switch to Base network in your wallet.');
                        }
                      }
                    }}>
                      Switch to Base
                    </Button>
                  </div>
                )}
                {(!isSolana && evmChainId === 8453 || isSolana) && (
                  <Button variant="primary" onClick={handlePay} isLoading={status === 'pending' || status === 'confirming'} className="w-full text-xs gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    {status === 'pending' ? 'Confirm in wallet...' : status === 'confirming' ? 'Verifying on-chain...' : `Pay ${asset}`}
                  </Button>
                )}
              </>
            )}

            {walletConnected && (
              <p className="text-[11px] text-ink-faint text-center font-mono">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}</p>
            )}
          </div>
        )}

        {error && <div className="p-2.5 rounded-lg bg-red-50 text-red-900 border border-red-300 text-xs">{error}</div>}

        <div className="flex items-center gap-1.5 text-[11px] text-ink-soft pt-2 border-t border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>One-time unlock for lifetime course access.</span>
        </div>
      </div>
    </div>
  );
}

function encodeUsdcTransfer(to: Address, amount: bigint): `0x${string}` {
  const selector = '0xa9059cbb';
  const paddedTo = to.slice(2).padStart(64, '0');
  const paddedAmount = amount.toString(16).padStart(64, '0');
  return `0x${selector}${paddedTo}${paddedAmount}`;
}
