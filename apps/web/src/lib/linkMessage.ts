/**
 * Canonical message a user signs to prove that a Solana address and an EVM
 * address belong to the same person. It is short, human readable, and carries
 * a timestamp so a stale signature cannot be reused indefinitely.
 */
export interface LinkMessage {
  solana: string;
  evm: string;
  issuedAt: string;
}

export function buildLinkMessage(
  solana: string,
  evm: string,
  issuedAt: string = new Date().toISOString()
): string {
  return [
    'Rekt School wallet link',
    `Solana: ${solana}`,
    `EVM: ${evm}`,
    `Issued at: ${issuedAt}`,
  ].join('\n');
}

export function parseLinkMessage(message: string): LinkMessage | null {
  const solana = message.match(/^Solana:\s*(\S+)$/m)?.[1];
  const evm = message.match(/^EVM:\s*(\S+)$/m)?.[1];
  const issuedAt = message.match(/^Issued at:\s*(\S+)$/m)?.[1];
  if (!solana || !evm || !issuedAt) return null;
  if (!message.startsWith('Rekt School wallet link')) return null;
  return { solana, evm, issuedAt };
}

/** Reject signatures older than this window. */
export const LINK_MESSAGE_MAX_AGE_MS = 10 * 60 * 1000;

export function isFreshLinkMessage(issuedAt: string): boolean {
  const time = Date.parse(issuedAt);
  if (Number.isNaN(time)) return false;
  return Math.abs(Date.now() - time) <= LINK_MESSAGE_MAX_AGE_MS;
}
