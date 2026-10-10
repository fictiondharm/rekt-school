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
  FUSDC_MINT: process.env.FUSDC_MINT || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', // Devnet USDC
  COURSE_TREASURY: 'Quest11111111111111111111111111111111111111',
};

export type TaskId =
  | 'connect_wallet'
  | 'claim_gas'
  | 'send_transfer'
  | 'claim_fusdc'
  | 'mint_token'
  | 'swap_in_course_pool';

export interface TaskDefinition {
  id: TaskId;
  title: string;
  description: string;
  auraReward: number;
}

export const TASKS_CATALOGUE: Record<TaskId, TaskDefinition> = {
  connect_wallet: {
    id: 'connect_wallet',
    title: 'Connect & Link Wallet',
    description: 'Connect your Phantom or Solflare wallet and verify ownership with a signed challenge.',
    auraReward: 50,
  },
  claim_gas: {
    id: 'claim_gas',
    title: 'Claim Devnet Gas (SOL)',
    description: 'Receive free devnet SOL from our server faucet to pay for transaction fees.',
    auraReward: 50,
  },
  send_transfer: {
    id: 'send_transfer',
    title: 'Send a Test Transfer',
    description: 'Execute a real on-chain transaction sending 0.01 SOL on Solana Devnet.',
    auraReward: 75,
  },
  claim_fusdc: {
    id: 'claim_fusdc',
    title: 'Claim 10,000 fUSDC',
    description: 'Mint 10,000 test course USDC into your Associated Token Account.',
    auraReward: 75,
  },
  mint_token: {
    id: 'mint_token',
    title: 'Mint Your Custom Token',
    description: 'Deploy an SPL token mint where your wallet is the designated creator.',
    auraReward: 100,
  },
  swap_in_course_pool: {
    id: 'swap_in_course_pool',
    title: 'Execute AMM Swap',
    description: 'Swap fUSDC for SOL on our devnet constant-product AMM pool.',
    auraReward: 100,
  },
};
