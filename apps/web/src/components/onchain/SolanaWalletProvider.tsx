'use client';

import React, { useMemo, useCallback, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletError } from '@solana/wallet-adapter-base';
import { DEVNET_RPC_URL } from '@/lib/solana';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

export interface SolanaWalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // Empty wallets array because @solana/wallet-adapter-react v0.15 automatically detects
  // standard wallets (Phantom, Solflare, Backpack) registered in the browser window via Wallet Standard!
  const wallets = useMemo(() => [], []);

  // Safe error handler so unhandled wallet exceptions never crash React tree
  const onError = useCallback((error: WalletError) => {
    console.warn('[Solana Wallet Adapter caught exception]:', error.name, error.message);
  }, []);

  return (
    <ConnectionProvider endpoint={DEVNET_RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
