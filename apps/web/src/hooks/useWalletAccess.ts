'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { setCourseUnlocked } from '@/lib/unlock';

/**
 * Grants access when the connected wallet already paid.
 *
 * The local unlock flag only lives in one browser. This hook asks the server
 * whether the connected wallet has an entitlement, so a buyer who paid on one
 * device still has every lesson open on another one.
 */
export function useWalletAccess(onUnlocked?: () => void) {
  const { publicKey, connected } = useWallet();
  const address = publicKey?.toBase58();

  useEffect(() => {
    if (!connected || !address) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/access/check?wallet=${address}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.unlocked) return;
        setCourseUnlocked();
        onUnlocked?.();
      } catch {
        // Offline or Supabase not configured: keep the local flag as the source
        // of truth.
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, address]);
}
