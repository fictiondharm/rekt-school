'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import { DollarSign, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getMint,
} from '@solana/spl-token';
import {
  createWalletClient,
  custom,
  erc20Abi,
  parseEther,
  toHex,
  type Address,
  type Hex,
} from 'viem';
import { base } from 'viem/chains';
import bs58 from 'bs58';
import { buildLinkMessage } from '@/lib/linkMessage';
import {
  BASE_CHAIN_ID,
  BASE_USDC,
  BASE_TREASURY,
  USDC_DECIMALS,
  baseClient,
} from '@/lib/base';
import { UNLOCK_PRICE_USD, UNLOCK_USDC_AMOUNT } from '@/lib/pricing';
import { setCourseUnlocked } from '@/lib/unlock';
import { WalletConnectButton } from './WalletPicker';

type Chain = 'solana-mainnet' | 'solana-devnet' | 'base';
type Asset = 'USDC' | 'USDT' | 'SOL' | 'ETH';

const CHAIN_ASSETS: Record<Chain, Asset[]> = {
  'solana-mainnet': ['USDC', 'USDT', 'SOL'],
  'solana-devnet': ['USDC', 'SOL'],
  base: ['USDC', 'ETH'],
};

/** Token mints, keyed by chain and asset. Native SOL / ETH are not listed. */
const TOKEN_MINTS: Record<string, string> = {
  'solana-mainnet:USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'solana-mainnet:USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  // Devnet: the course fUSDC (from the in-app faucet) and Circle's devnet USDC.
  'solana-devnet:USDC': 'G5U9iSQwKogEbdQx9DuJ6qFcRyYpkqbtFiafCtLFoHNd',
};

/** True when the asset is a token (not the chain's native coin). */
const isTokenAsset = (asset: Asset) => asset === 'USDC' || asset === 'USDT';

/** Treasury wallet that receives the unlock payment. */
const TREASURY_SOLANA = 'HtKPeixUAG5a28rxn4weDqyNfwb8BwSmEp7y7xfZHTf5';

/** Used when the live price feed is unreachable. */
const FALLBACK_PRICES: Record<Asset, number> = {
  USDC: 1,
  USDT: 1,
  SOL: 150,
  ETH: 3000,
};

/** Buffer so a small price move between filling and paying never under-pays. */
const PRICE_BUFFER = 1.03;

interface PendingPayment {
  chain: string;
  txHash: string;
  wallet: string;
}

/** Remember a sent payment so a reload never asks the buyer to pay twice. */
const PENDING_KEY = 'rekt_school_pending_tx';

function persistPending(pending: PendingPayment | null) {
  try {
    if (pending) window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    else window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage can be blocked — the in-memory copy still works */
  }
}

function readPending(): PendingPayment | null {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.txHash && parsed?.chain && parsed?.wallet) return parsed;
  } catch {
    /* ignore malformed entries */
  }
  return null;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [chain, setChain] = useState<Chain>('solana-mainnet');
  const [asset, setAsset] = useState<Asset>('USDC');
  const [amount, setAmount] = useState(UNLOCK_USDC_AMOUNT);
  const [priceUsd, setPriceUsd] = useState<number>(1);
  const [status, setStatus] = useState<'idle' | 'pending' | 'confirming' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<Address | null>(null);
  const [evmChainId, setEvmChainId] = useState<number | null>(null);
  const [lastTx, setLastTx] = useState<PendingPayment | null>(null);
  const [linkState, setLinkState] = useState<'idle' | 'signing' | 'done' | 'error'>('idle');
  const [linkError, setLinkError] = useState<string | null>(null);

  const { publicKey, sendTransaction, connected: solanaConnected, signMessage } = useWallet();

  // Phantom exposes an EVM provider too (window.phantom.ethereum). Fall back to
  // it when no standard window.ethereum is injected so Base payments work.
  const getEvmProvider = () =>
    (typeof window !== 'undefined' &&
      ((window as any).ethereum || (window as any).phantom?.ethereum)) ||
    null;

  const connectEvm = async () => {
    const provider = getEvmProvider();
    if (!provider) {
      setError('No EVM wallet found. Install MetaMask or Phantom.');
      return;
    }
    try {
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      const evm = accounts[0] as Address;
      setEvmAddress(evm);
      const chainId: string = await provider.request({ method: 'eth_chainId' });
      setEvmChainId(parseInt(chainId, 16));

      // A wallet connected through Solana (Phantom) pays from its EVM account.
      // If that EVM account already owns an entitlement, unlock instead of
      // asking for a second payment.
      try {
        const res = await fetch(`/api/access/check?wallet=${evm}`);
        const data = await res.json();
        if (data?.unlocked) {
          setStatus('done');
          setCourseUnlocked();
          onSuccess();
        }
      } catch {
        /* entitlement lookup is best-effort */
      }
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

  useEffect(() => {
    const pending = readPending();
    if (pending) setLastTx(pending);
  }, []);

  /** Live USD price of the selected asset, with a static fallback. */
  const fetchAssetPrice = useCallback(async (selected: Asset): Promise<number> => {
    if (selected === 'USDC' || selected === 'USDT') return 1;
    const id = selected === 'SOL' ? 'solana' : 'ethereum';
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
      );
      const data = await res.json();
      const price = data?.[id]?.usd;
      if (typeof price === 'number' && price > 0) return price;
    } catch {
      // Fall through to the static price.
    }
    return FALLBACK_PRICES[selected];
  }, []);

  // Auto-fill the amount whenever the asset changes: stablecoins are always
  // 1.49, SOL/ETH are converted from the live price with a small buffer.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const price = await fetchAssetPrice(asset);
      if (cancelled) return;
      setPriceUsd(price);
      setAmount(
        isTokenAsset(asset)
          ? UNLOCK_USDC_AMOUNT
          : ((UNLOCK_PRICE_USD / price) * PRICE_BUFFER).toFixed(asset === 'ETH' ? 6 : 4)
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [asset, isOpen, fetchAssetPrice]);

  if (!isOpen) return null;

  const isSolana = chain !== 'base';
  const walletConnected = isSolana ? solanaConnected : !!evmAddress;
  const walletAddress = isSolana ? publicKey?.toBase58() : evmAddress;
  const amountValue = parseFloat(amount);
  const amountValid = Number.isFinite(amountValue) && amountValue > 0;
  const usdValue = amountValid
    ? isTokenAsset(asset)
      ? amountValue
      : amountValue * priceUsd
    : 0;
  const belowMinimum = usdValue < UNLOCK_PRICE_USD - 0.0001;

  const handleChainChange = (c: Chain) => {
    setChain(c);
    setAsset(CHAIN_ASSETS[c][0]);
    setStatus('idle');
    setError(null);
  };

  const handleAssetChange = (a: Asset) => {
    setAsset(a);
    setStatus('idle');
    setError(null);
  };

  const handleSolanaPay = async () => {
    if (!publicKey || !sendTransaction) return;
    if (!amountValid) {
      setStatus('error');
      setError('Enter a valid amount.');
      return;
    }
    if (belowMinimum) {
      setStatus('error');
      setError(`Minimum is $${UNLOCK_PRICE_USD.toFixed(2)} worth of ${asset}.`);
      return;
    }

    setStatus('pending');
    setError(null);

    try {
      const rpc =
        chain === 'solana-devnet'
          ? process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com'
          : process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com';
      const conn = new Connection(rpc, 'confirmed');
      const treasury = new PublicKey(TREASURY_SOLANA);
      const tx = new Transaction();

      if (isTokenAsset(asset)) {
        const mintAddress = TOKEN_MINTS[`${chain}:${asset}`];
        if (!mintAddress) {
          setStatus('error');
          setError(`${asset} is not available on ${chain}.`);
          return;
        }
        const tokenMint = new PublicKey(mintAddress);
        const fromATA = await getAssociatedTokenAddress(tokenMint, publicKey);
        const toATA = await getAssociatedTokenAddress(tokenMint, treasury);
        // Read the mint decimals on-chain so devnet fUSDC is not scaled wrong.
        const mintInfo = await getMint(conn, tokenMint);
        const baseUnits = Math.round(amountValue * 10 ** mintInfo.decimals);

        // Idempotent ATA creation so a first-time payer without a token
        // account can still pay.
        tx.add(
          createAssociatedTokenAccountIdempotentInstruction(
            publicKey,
            fromATA,
            publicKey,
            tokenMint
          )
        );
        tx.add(
          createAssociatedTokenAccountIdempotentInstruction(
            publicKey,
            toATA,
            treasury,
            tokenMint
          )
        );
        tx.add(createTransferInstruction(fromATA, toATA, publicKey, BigInt(baseUnits)));
      } else {
        tx.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: treasury,
            lamports: Math.round(amountValue * LAMPORTS_PER_SOL),
          })
        );
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
    if (!amountValid) {
      setStatus('error');
      setError('Enter a valid amount.');
      return;
    }
    if (belowMinimum) {
      setStatus('error');
      setError(`Minimum is $${UNLOCK_PRICE_USD.toFixed(2)} worth of ${asset}.`);
      return;
    }

    setStatus('pending');
    setError(null);

    try {
      const provider = getEvmProvider();
      if (!provider) {
        setStatus('error');
        setError('No EVM wallet found. Install MetaMask or Phantom.');
        return;
      }

      // Phantom only exposes accounts to dapps that asked for them explicitly,
      // so request them here instead of trusting an address from a stale event.
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      const from = accounts?.[0] as Address | undefined;
      if (!from) {
        setStatus('error');
        setError('Connect your wallet and try again.');
        return;
      }
      setEvmAddress(from);

      // Wallets refuse to send to a token contract that does not exist on the
      // chain they are currently on, so make sure we are on Base first.
      await ensureBaseChain(provider);
      setEvmChainId(BASE_CHAIN_ID);

      // Build the transaction through viem so every wallet gets a complete,
      // standard payload (chainId, gas, nonce) instead of hand-rolled fields.
      const wallet = createWalletClient({
        account: from,
        chain: base,
        transport: custom(provider),
      });

      let txHash: Hex;

      if (asset === 'USDC') {
        const amount = BigInt(Math.round(amountValue * 10 ** USDC_DECIMALS));
        // Estimate against a public RPC first so a missing balance is reported
        // by us, not by the wallet as an opaque "invalid parameters" error.
        const gas = await estimateGasSafe(() =>
          baseClient.estimateContractGas({
            account: from,
            address: BASE_USDC,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [BASE_TREASURY, amount],
          })
        );
        txHash = await wallet.writeContract({
          address: BASE_USDC,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [BASE_TREASURY, amount],
          account: from,
          chain: base,
          ...(gas ? { gas } : {}),
        });
      } else {
        const value = parseEther(amountValue.toString());
        const gas = await estimateGasSafe(() =>
          baseClient.estimateGas({ account: from, to: BASE_TREASURY, value })
        );
        txHash = await wallet.sendTransaction({
          to: BASE_TREASURY,
          value,
          account: from,
          chain: base,
          ...(gas ? { gas } : {}),
        });
      }

      // The hash exists as soon as the wallet signs, but the payment only
      // counts once it is mined. Wait for the receipt so verification does not
      // race the block and report a real payment as "not found".
      setStatus('confirming');
      try {
        await baseClient.waitForTransactionReceipt({
          hash: txHash,
          timeout: 90_000,
          pollingInterval: 2_000,
        });
      } catch {
        // Still unconfirmed or the RPC hiccuped — the server waits as well.
      }

      await verifyAndUnlock('base', txHash, from);
    } catch (err: any) {
      console.error('[base-pay]', err);
      setStatus('error');
      setError(evmErrorMessage(err));
    }
  };

  const verifyAndUnlock = async (chainName: string, txHash: string, wallet: string) => {
    setStatus('confirming');
    setError(null);
    setLastTx({ chain: chainName, txHash, wallet });
    persistPending({ chain: chainName, txHash, wallet });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const res = await fetch('/api/payments/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chain: chainName, txHash, wallet, asset }),
        });
        const data = await res.json();

        if (data.success) {
          setStatus('done');
          setLastTx(null);
          persistPending(null);
          setCourseUnlocked();
          onSuccess();
          return;
        }

        const retryable = /not found|below \$|wait a few seconds/i.test(data.message || '');
        if (retryable && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 5_000));
          continue;
        }

        setStatus('error');
        setError(data.message || 'Verification failed.');
        return;
      } catch {
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 5_000));
          continue;
        }
        setStatus('error');
        setError('Network error. Your payment is safe — tap "Retry verification".');
        return;
      }
    }
  };

  /** Re-check the payment that was already sent, without paying again. */
  const retryVerification = async () => {
    if (lastTx) {
      await verifyAndUnlock(lastTx.chain, lastTx.txHash, lastTx.wallet);
      return;
    }
    await restoreAccess();
  };

  /** Scan the treasury for a payment from this wallet and unlock it. */
  const restoreAccess = async () => {
    const wallet = evmAddress;
    if (!wallet) {
      setError('Connect the wallet you paid with first.');
      return;
    }

    setStatus('confirming');
    setError(null);

    try {
      const res = await fetch('/api/payments/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain: 'base', wallet }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('done');
        setLastTx(null);
        persistPending(null);
        setCourseUnlocked();
        onSuccess();
        return;
      }

      setStatus('error');
      setError(data.message || 'No payment found for this wallet.');
    } catch {
      setStatus('error');
      setError('Network error. Try again in a moment.');
    }
  };

  /**
   * Prove that the connected Solana address and the EVM address belong to the
   * same person, so one payment unlocks both. The Solana wallet signs the link
   * message; the EVM wallet signs too when the payment is on the Solana side.
   */
  const linkWalletsFlow = async () => {
    if (!publicKey || !evmAddress || !signMessage) {
      setLinkState('error');
      setLinkError('Connect both wallets first.');
      return;
    }

    setLinkState('signing');
    setLinkError(null);

    try {
      const solana = publicKey.toBase58();
      const message = buildLinkMessage(solana, evmAddress);
      const signed = await signMessage(new TextEncoder().encode(message));

      const payload: Record<string, string> = {
        solanaAddress: solana,
        evmAddress,
        message,
        solanaSignature: bs58.encode(signed),
      };

      const post = () =>
        fetch('/api/wallet/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then((res) => res.json());

      let data = await post();

      if (!data.success && data.needsEvmSignature) {
        const provider = getEvmProvider();
        if (!provider) throw new Error('No EVM wallet found to sign with.');
        const evmSignature: string = await provider.request({
          method: 'personal_sign',
          params: [toHex(message), evmAddress],
        });
        payload.evmSignature = evmSignature;
        data = await post();
      }

      if (data.success) {
        setLinkState('done');
        setCourseUnlocked();
        onSuccess();
        return;
      }

      setLinkState('error');
      setLinkError(data.message || 'Could not link these wallets.');
    } catch (err: any) {
      setLinkState('error');
      setLinkError(
        /rejected|denied|cancel/i.test(err?.message || '')
          ? 'Signature cancelled.'
          : err?.message || 'Could not link these wallets.'
      );
    }
  };

  const handlePay = () => {
    if (isSolana) handleSolanaPay();
    else handleBasePay();
  };

  const networkLabel =
    chain === 'solana-mainnet' ? 'Solana Mainnet' : chain === 'solana-devnet' ? 'Solana Devnet' : 'Base';

  const payButtonLabel =
    status === 'pending'
      ? 'Confirm in wallet...'
      : status === 'confirming'
        ? 'Verifying on-chain...'
        : `Pay ${amount || '0'} ${asset}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-2xl sm:rounded-xl border-2 border-ink p-5 sm:p-8 max-w-md w-full shadow-pop-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start pb-3 border-b border-border shrink-0">
          <div>
            <Badge variant="accent" className="text-[10px] mb-1">
              EARLY ACCESS
            </Badge>
            <h3 className="font-heading font-bold text-xl text-ink">
              Unlock All Lessons for ${UNLOCK_PRICE_USD.toFixed(2)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-ink-soft hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {status === 'done' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-quaternary/15 border-2 border-quaternary space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 text-quaternary mx-auto" />
                <p className="font-heading font-bold text-ink">Payment Confirmed!</p>
                <p className="text-xs text-ink-soft">
                  Every lesson is unlocked — on this device and on any device that
                  connects{' '}
                  {publicKey
                    ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-4)}`
                    : 'this wallet'}
                  . You will never be asked to pay again.
                </p>
              </div>
              <Button variant="primary" onClick={onClose} className="w-full">
                Start Learning
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 p-1 bg-bg rounded-lg">
                {(['solana-mainnet', 'solana-devnet', 'base'] as Chain[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleChainChange(c)}
                    className={`py-2 text-[11px] font-bold font-heading rounded-full transition-colors ${
                      chain === c
                        ? 'bg-accent text-white border-2 border-ink shadow-pop-sm'
                        : 'bg-white text-ink-soft border-2 border-border'
                    }`}
                  >
                    {c === 'solana-mainnet' ? 'Solana' : c === 'solana-devnet' ? 'Devnet' : 'Base'}
                  </button>
                ))}
              </div>

              <div
                className={`grid gap-2 p-1 bg-bg rounded-lg ${
                  CHAIN_ASSETS[chain].length > 2 ? 'grid-cols-3' : 'grid-cols-2'
                }`}
              >
                {CHAIN_ASSETS[chain].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleAssetChange(a)}
                    className={`py-2 text-[11px] font-bold font-heading rounded-full transition-colors ${
                      asset === a
                        ? 'bg-tertiary text-ink border-2 border-ink shadow-pop-sm'
                        : 'bg-white text-ink-soft border-2 border-border'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Asset:</span>
                  <span className="font-mono font-bold text-ink">{asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Network:</span>
                  <span className="font-mono text-ink">{networkLabel}</span>
                </div>
                {isTokenAsset(asset) && (
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Amount:</span>
                    <span className="font-mono font-bold text-accent text-sm">
                      {UNLOCK_USDC_AMOUNT} {asset}
                    </span>
                  </div>
                )}

                <div className="pt-1 border-t border-accent/20">
                  <label className="text-ink-soft text-[11px] font-bold uppercase tracking-wide">
                    Amount ({asset})
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setStatus('idle');
                      setError(null);
                    }}
                    placeholder={asset === 'SOL' ? '0.0100' : asset === 'ETH' ? '0.000500' : '1.49'}
                    className="mt-1 w-full px-3 py-2 text-sm font-mono bg-white rounded-lg border-2 border-border focus:border-accent focus:outline-none"
                  />
                  <p className="text-[11px] text-ink-faint mt-1 flex justify-between">
                    <span>Minimum ${UNLOCK_PRICE_USD.toFixed(2)}</span>
                    <span className="font-mono">
                      ≈ ${usdValue ? usdValue.toFixed(2) : '0.00'}
                      {!isTokenAsset(asset) && priceUsd ? ` @ $${priceUsd.toFixed(2)}` : ''}
                    </span>
                  </p>
                </div>
              </div>

              {!walletConnected ? (
                <div className="p-3 rounded-xl bg-tertiary/20 border border-tertiary text-xs text-center space-y-2">
                  <p className="font-bold text-ink mb-1">Connect your wallet first</p>
                  {!isSolana && (
                    <Button variant="secondary" onClick={connectEvm} className="w-full text-xs">
                      Connect EVM Wallet
                    </Button>
                  )}
                  {isSolana && (
                    <div className="space-y-2">
                      <WalletConnectButton className="w-full" />
                      <p className="text-ink-soft">
                        Or use the Connect Wallet button in the top bar.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-900 border border-red-300 text-xs space-y-2">
                  <p>{error}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={retryVerification}
                      className="rounded-full border border-red-400 bg-white px-3 py-1.5 font-bold hover:bg-red-100"
                    >
                      {lastTx ? 'Retry verification' : 'I already paid — restore access'}
                    </button>
                    {lastTx && chain === 'base' && (
                      <button
                        type="button"
                        onClick={restoreAccess}
                        className="rounded-full border border-red-400 bg-white px-3 py-1.5 font-bold hover:bg-red-100"
                      >
                        Search my Base payments
                      </button>
                    )}
                  </div>
                  {lastTx && (
                    <p className="font-mono text-[10px] text-red-800 break-all">
                      tx {lastTx.txHash}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {solanaConnected && evmAddress && (
            <div className="rounded-xl border border-border bg-surface-muted p-3 text-xs space-y-2">
              {linkState === 'done' ? (
                <p className="font-bold text-quaternary">
                  Linked — this payment now covers both addresses.
                </p>
              ) : (
                <>
                  <p className="font-bold text-ink">Paid from your Base account?</p>
                  <p className="text-ink-soft">
                    This site connects through Solana, but the payment was signed by your
                    EVM address. Sign once to prove both addresses are yours.
                  </p>
                  <button
                    type="button"
                    onClick={linkWalletsFlow}
                    disabled={linkState === 'signing'}
                    className="rounded-full border-2 border-ink bg-white px-3 py-1.5 font-bold text-ink shadow-pop-sm disabled:opacity-60"
                  >
                    {linkState === 'signing' ? 'Waiting for signature…' : 'Link these wallets'}
                  </button>
                  {linkState === 'error' && linkError && (
                    <p className="text-red-800">{linkError}</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {status !== 'done' && (
          <div className="shrink-0 pt-3 border-t border-border space-y-2">
            {walletConnected ? (
              <>
                <Button
                  variant="primary"
                  onClick={handlePay}
                  isLoading={status === 'pending' || status === 'confirming'}
                  disabled={!amountValid || belowMinimum}
                  className="w-full text-xs gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  {payButtonLabel}
                </Button>
                <p className="text-[11px] text-ink-faint text-center font-mono">
                  {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-soft">
                <Wallet className="w-3.5 h-3.5" />
                Connect a wallet to unlock the Pay button
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-ink-soft pt-2 border-t border-border">
              <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>One-time unlock for lifetime course access.</span>
            </div>
            <p className="text-[10px] text-ink-faint text-center leading-snug">
              By paying you agree to our{' '}
              <Link href="/terms" className="underline hover:text-accent">
                Terms
              </Link>{' '}
              ,{' '}
              <Link href="/refunds" className="underline hover:text-accent">
                Refund Policy
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-accent">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Make sure the injected wallet is on Base (8453) before sending a tx. */
async function ensureBaseChain(provider: any) {
  const current: string = await provider.request({ method: 'eth_chainId' });
  if (parseInt(current, 16) === BASE_CHAIN_ID) return;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
    });
  } catch (err: any) {
    if (err?.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
            chainName: 'Base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org'],
          },
        ],
      });
    } else if (err?.code === 4001) {
      throw new Error(
        'You cancelled the network switch. Switch your wallet to Base to pay with USDC.'
      );
    } else {
      throw new Error('Switch your wallet network to Base (chain id 8453) and try again.');
    }
  }

  const after: string = await provider.request({ method: 'eth_chainId' });
  if (parseInt(after, 16) !== BASE_CHAIN_ID) {
    throw new Error('Your wallet is not on Base. Switch to Base and try again.');
  }
}

/** viem nests provider errors; flatten them into one searchable string. */
function collectErrorText(err: any): string {
  const parts: string[] = [];
  let cursor: any = err;
  for (let i = 0; i < 6 && cursor; i += 1) {
    if (typeof cursor === 'string') {
      parts.push(cursor);
      break;
    }
    if (cursor.message) parts.push(String(cursor.message));
    if (cursor.shortMessage) parts.push(String(cursor.shortMessage));
    if (cursor.data?.message) parts.push(String(cursor.data.message));
    cursor = cursor.cause;
  }
  return parts.join(' | ');
}

/**
 * Estimate gas with a public RPC so balance problems surface as our message.
 * If the RPC itself fails, fall back to letting the wallet estimate.
 */
async function estimateGasSafe(fn: () => Promise<bigint>): Promise<bigint | undefined> {
  try {
    return await fn();
  } catch (err) {
    const text = collectErrorText(err);
    if (/exceeds balance|insufficient balance|exceeds allowance|reverted/i.test(text)) {
      throw err;
    }
    return undefined;
  }
}

/** Turn wallet provider errors into something a buyer can act on. */
function evmErrorMessage(err: any): string {
  const raw = collectErrorText(err);

  if (err?.code === 4001 || /user rejected|user denied|rejected the request|cancelled|canceled/i.test(raw)) {
    return 'Transaction cancelled.';
  }
  if (/insufficient funds/i.test(raw)) {
    return 'Not enough ETH on Base to cover gas fees.';
  }
  if (/exceeds balance|insufficient balance|transfer amount exceeds/i.test(raw)) {
    return 'Not enough USDC on Base. Add USDC to this wallet and try again.';
  }
  if (/chain mismatch|does not match the target chain|current chain of the wallet/i.test(raw)) {
    return 'Your wallet is not on Base. Switch to Base and try again.';
  }
  if (/missing or invalid parameters|invalid params|-32602|invalid argument/i.test(raw)) {
    return 'Your wallet rejected the request. Make sure it is on Base, then try again.';
  }
  if (/execution reverted|reverted/i.test(raw)) {
    return 'The token transfer was rejected by the contract. Check you have enough USDC on Base.';
  }
  return raw || 'Transaction failed.';
}
