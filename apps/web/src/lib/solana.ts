import { Connection, clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import { assertDevnetCluster } from './cluster-guard';

export const DEVNET_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  clusterApiUrl('devnet');

export const SERVER_RPC_URL =
  process.env.SOLANA_DEVNET_RPC_URL ||
  process.env.RPC_URL_SERVER ||
  DEVNET_RPC_URL;

/**
 * Returns a devnet Connection with confirmed commitment.
 */
export function getSolanaConnection(): Connection {
  assertDevnetCluster();
  return new Connection(DEVNET_RPC_URL, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
}

export const getConnection = getSolanaConnection;

/**
 * Server-side connection with finalized commitment.
 */
export function getServerSolanaConnection(): Connection {
  assertDevnetCluster();
  return new Connection(SERVER_RPC_URL, {
    commitment: 'confirmed',
  });
}

// Known course addresses on devnet
export const COURSE_PROGRAM_IDS = {
  FUSDC_MINT: process.env.FUSDC_MINT || 'G5U9iSQwKogEbdQx9DuJ6qFcRyYpkqbtFiafCtLFoHNd', // Course fUSDC (devnet)
  COURSE_TREASURY: 'Quest11111111111111111111111111111111111111',
};

