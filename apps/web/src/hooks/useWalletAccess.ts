'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { setCourseUnlocked } from '@/lib/unlock';

/** Wallets whose recovery scan already ran in this page session. */
const attempted = new Set<string>();

function getInjectedEvmProvider(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum || (window as any).phantom?.ethereum || null;
}

/**
 * Grants access when the connected wallet already paid.
 *
 * The local unlock flag only lives in one browser. This hook asks the server
 * whether the connected wallet has an entitlement, so a buyer who paid on one
 * device still has every lesson open on another one.
 *
 * It also covers a payment that confirmed on-chain but never got recorded —
 * the tab was closed, the request timed out, or the database was unreachable
 * at that moment. In that case the treasury is scanned for the wallet's recent
 * payment and the entitlement is recreated.
 */
export function useWalletAccess(onUnlocked?: () => void) {
  const { publicKey, connected } = useWallet();
  const address = publicKey?.toBase58();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const unlock = () => {
      if (cancelled) return;
      setCourseUnlocked();
      onUnlocked?.();
    };

    const checkWallet = async (wallet: string, chain?: string) => {
      try {
        const res = await fetch(`/api/access/check?wallet=${wallet}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.unlocked) {
            unlock();
            return;
          }
        }

        // Paid but never recorded: look for the payment on-chain, once per
        // wallet per session, so a reload cannot spam the RPC.
        if (chain !== 'base') return;
        const key = `${chain}:${wallet}`;
        if (attempted.has(key)) return;
        attempted.add(key);

        const rec = await fetch('/api/payments/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chain, wallet }),
        });
        if (!rec.ok) return;
        const recovered = await rec.json();
        if (recovered?.success) unlock();
      } catch {
        // Offline or Supabase not configured: keep the local flag as the source
        // of truth.
      }
    };

    if (connected && address) void checkWallet(address, 'solana-mainnet');

    const evmProvider = getInjectedEvmProvider();
    if (evmProvider) {
      evmProvider
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts?.[0]) void checkWallet(accounts[0], 'base');
        })
        .catch(() => {
          /* no EVM account authorised */
        });

      const onAccountsChanged = (accounts: string[]) => {
        if (accounts?.[0]) void checkWallet(accounts[0], 'base');
      };
      evmProvider.on?.('accountsChanged', onAccountsChanged);

      return () => {
        cancelled = true;
        evmProvider.removeListener?.('accountsChanged', onAccountsChanged);
      };
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, address]);
}
