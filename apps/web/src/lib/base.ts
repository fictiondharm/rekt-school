import { createPublicClient, getAddress, http, type Address, type Hash } from 'viem';
import { base } from 'viem/chains';
import { UNLOCK_PRICE_USD } from '@/lib/pricing';

/**
 * Canonical Base mainnet USDC. `getAddress` throws on a bad EIP-55 checksum, so
 * a typo fails the build instead of reaching a wallet as "invalid parameters".
 */
export const BASE_USDC = getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') as Address;
export const BASE_TREASURY = getAddress('0x469a7cDbD8228fb1Eb29dA6A3D62949a880deaa2') as Address;
export const BASE_CHAIN_ID = 8453;

export const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

export const USDC_DECIMALS = 6;
/** Minimum USDC transfer that counts as an unlock payment. */
export const MIN_UNLOCK_USDC = BigInt(
  Math.round(UNLOCK_PRICE_USD * 10 ** USDC_DECIMALS)
);

export async function verifyBasePayment(txHash: Hash): Promise<{
  valid: boolean;
  from?: Address;
  amount?: bigint;
}> {
  try {
    const receipt = await baseClient.getTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') return { valid: false };

    const tx = await baseClient.getTransaction({ hash: txHash });
    if (tx.to?.toLowerCase() !== BASE_USDC.toLowerCase()) return { valid: false };

    const logs = await baseClient.getLogs({
      address: BASE_USDC,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', name: 'from', indexed: true },
          { type: 'address', name: 'to', indexed: true },
          { type: 'uint256', name: 'value', indexed: false },
        ],
      },
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    for (const log of logs) {
      const to = (log.args as { to?: Address }).to;
      const value = (log.args as { value?: bigint }).value;
      const from = (log.args as { from?: Address }).from;
      if (
        to?.toLowerCase() === BASE_TREASURY.toLowerCase() &&
        value !== undefined &&
        value >= MIN_UNLOCK_USDC
      ) {
        return { valid: true, from, amount: value };
      }
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}
