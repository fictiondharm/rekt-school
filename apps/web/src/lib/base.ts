import { createPublicClient, http, type Address, type Hash } from 'viem';
import { base } from 'viem/chains';
import { UNLOCK_PRICE_USD } from '@/lib/pricing';

export const BASE_USDC = '0x833589fCD1eD18E646dC60844d597A8678760cD0' as Address;
export const BASE_TREASURY = '0x469a7cDbD8228fb1Eb29dA6A3D62949a880deaa2' as Address;

/**
 * USDT on Base. Base has no canonical USDT, so the token address is opt-in
 * through the environment: set NEXT_PUBLIC_BASE_USDT_ADDRESS to enable it.
 */
export const BASE_USDT = (process.env.NEXT_PUBLIC_BASE_USDT_ADDRESS ||
  '') as Address;
export const BASE_USDT_DECIMALS = Number(
  process.env.NEXT_PUBLIC_BASE_USDT_DECIMALS || '6'
);

export const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

export const USDC_DECIMALS = 6;
/** Minimum USDC transfer that counts as an unlock payment. */
export const MIN_UNLOCK_USDC = BigInt(
  Math.round(UNLOCK_PRICE_USD * 10 ** USDC_DECIMALS)
);

export async function verifyBasePayment(
  txHash: Hash,
  token: Address = BASE_USDC,
  decimals: number = USDC_DECIMALS
): Promise<{
  valid: boolean;
  from?: Address;
  amount?: bigint;
}> {
  try {
    const receipt = await baseClient.getTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') return { valid: false };

    const tx = await baseClient.getTransaction({ hash: txHash });
    if (tx.to?.toLowerCase() !== token.toLowerCase()) return { valid: false };

    const minAmount = BigInt(
      Math.round(UNLOCK_PRICE_USD * 10 ** decimals)
    );

    const logs = await baseClient.getLogs({
      address: token,
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
        value >= minAmount
      ) {
        return { valid: true, from, amount: value };
      }
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}
