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

const SANDBOX_BASIC_IDS = new Set(['B1', 'B3', 'B8', 'B9', 'B10']);

function baseMeta(tier: Tier, isDevnet: boolean): NetworkMeta {
  if (!isDevnet) {
    return {
      tier,
      isDevnet: false,
      badgeLabel: 'SANDBOX',
      badgeVariant: 'sandbox',
      networkName: 'Sandbox',
      clusterLine: 'Environment: Sandbox · simulated',
      blurb: 'Pure simulation — no wallet, no real chain, no real funds.',
    };
  }
  return {
    tier,
    isDevnet: true,
    badgeLabel: 'SOLANA DEVNET',
    badgeVariant: 'devnet',
    networkName: 'Solana Devnet',
    clusterLine: 'Cluster: Solana Devnet · free testnet gas',
    blurb: 'Live on Solana Devnet — real testnet transactions, 100% free play money.',
  };
}

/**
 * Tier 1 (basic) runs on real Solana Devnet for the on-chain lessons
 * (B2, B4, B5, B6, B7). Every other basic lesson (B1, B3, B8, B9, B10) is a
 * pure browser sandbox. Tier 2 (intermediate) runs entirely in a pure browser sandbox.
 */
export function getNetworkMeta(tier: Tier): NetworkMeta {
  return baseMeta(tier, tier !== 'intermediate');
}

export function getNetworkMetaByLesson(lessonId: string): NetworkMeta {
  const id = lessonId.trim().toUpperCase();
  const tier: Tier = id.startsWith('I') ? 'intermediate' : 'basic';
  const isSandbox = tier === 'intermediate' || SANDBOX_BASIC_IDS.has(id);
  return baseMeta(tier, !isSandbox);
}
