import type { Tier } from '@defi-mommy/content-schema';

export interface NetworkMeta {
  tier: Tier;
  isDevnet: boolean;
  badgeLabel: string;
  badgeVariant: 'devnet' | 'sandbox';
  networkName: string;
  clusterLine: string;
  blurb: string;
}

/**
 * Tier 1 (basic) runs on the real Solana Devnet testnet.
 * Tier 2 (intermediate) runs in a pure browser sandbox — no wallet, no chain.
 */
export function getNetworkMeta(tier: Tier): NetworkMeta {
  if (tier === 'intermediate') {
    return {
      tier: 'intermediate',
      isDevnet: false,
      badgeLabel: 'SANDBOX',
      badgeVariant: 'sandbox',
      networkName: 'Sandbox',
      clusterLine: 'Environment: Sandbox · simulated',
      blurb: 'Pure simulation — no wallet, no real chain, no real funds.',
    };
  }
  return {
    tier: 'basic',
    isDevnet: true,
    badgeLabel: 'SOLANA DEVNET',
    badgeVariant: 'devnet',
    networkName: 'Solana Devnet',
    clusterLine: 'Cluster: Solana Devnet · free testnet gas',
    blurb: 'Live on Solana Devnet — real testnet transactions, 100% free play money.',
  };
}
