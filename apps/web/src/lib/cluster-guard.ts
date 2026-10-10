/**
 * Cluster safety guard (Rule 2 from 00-READ-FIRST.md & 03-SYSTEM-DESIGN.md section 6.7)
 * Enforces that all app transactions and queries target Solana Devnet only.
 */

export const ALLOWED_CLUSTER = 'devnet';

export function getSolanaCluster(): string {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet';
  if (cluster !== ALLOWED_CLUSTER) {
    throw new Error(
      `CRITICAL SECURITY VIOLATION: Cluster configured as "${cluster}". Only "${ALLOWED_CLUSTER}" is allowed in Rekt School.`
    );
  }
  return cluster;
}

export function isDevnet(): boolean {
  return (process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet') === 'devnet';
}

export function assertDevnetCluster(): void {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet';
  if (cluster !== 'devnet') {
    throw new Error(
      `Cluster safety check failed! Expected cluster 'devnet' but received '${cluster}'. Mainnet is strictly blocked.`
    );
  }
}

