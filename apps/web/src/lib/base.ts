import {
  createPublicClient,
  getAddress,
  http,
  parseAbiItem,
  parseEventLogs,
  erc20Abi,
  type Address,
  type Hash,
} from 'viem';
import { base } from 'viem/chains';
import { UNLOCK_PRICE_USD } from '@/lib/pricing';

const TRANSFER_EVENT = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)'
);

/**
 * Canonical Base mainnet USDC. `getAddress` throws on a bad EIP-55 checksum, so
 * a typo fails the build instead of reaching a wallet as "invalid parameters".
 */
export const BASE_USDC = getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') as Address;
export const BASE_TREASURY = getAddress('0x469a7cDbD8228fb1Eb29dA6A3D62949a880deaa2') as Address;
export const BASE_CHAIN_ID = 8453;

export const baseClient = createPublicClient({
  chain: base,
  // mainnet.base.org rejects eth_getLogs ("request limit reached"), which the
  // payment-recovery scan needs.
  transport: http(
    process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://base-rpc.publicnode.com'
  ),
});

export const USDC_DECIMALS = 6;
/** Minimum USDC transfer that counts as an unlock payment. */
export const MIN_UNLOCK_USDC = BigInt(
  Math.round(UNLOCK_PRICE_USD * 10 ** USDC_DECIMALS)
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reads a transaction receipt, waiting for it to be mined first. A buyer who
 * has just signed the transaction hits this endpoint before the block exists,
 * so polling avoids the "payment not found" false negative.
 */
async function waitForReceipt(hash: Hash, attempts = 10, delayMs = 2500) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await baseClient.getTransactionReceipt({ hash });
    } catch {
      if (i === attempts - 1) return null;
      await sleep(delayMs);
    }
  }
  return null;
}

export async function verifyBasePayment(txHash: Hash): Promise<{
  valid: boolean;
  from?: Address;
  amount?: bigint;
}> {
  try {
    const receipt = await waitForReceipt(txHash);
    if (!receipt || receipt.status !== 'success') return { valid: false };

    const tx = await baseClient.getTransaction({ hash: txHash });
    if (tx.to?.toLowerCase() !== BASE_USDC.toLowerCase()) return { valid: false };

    // The receipt already carries this transaction's logs, so no extra
    // eth_getLogs call (or block range) is needed.
    const transfers = parseEventLogs({
      abi: erc20Abi,
      eventName: 'Transfer',
      logs: receipt.logs.filter(
        (log) => log.address.toLowerCase() === BASE_USDC.toLowerCase()
      ),
    });

    for (const log of transfers) {
      const { from, to, value } = log.args;
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

/**
 * Finds a recent USDC payment from `wallet` to the treasury. Used to restore
 * access when the buyer's transaction confirmed but the unlock call never
 * landed (closed tab, timeout, network error).
 */
export async function findRecentBasePayment(wallet: Address): Promise<{
  txHash: Hash;
  amount: bigint;
} | null> {
  try {
    const latest = await baseClient.getBlockNumber();
    const ranges = [5_000n, 1_000n];

    for (const span of ranges) {
      try {
        const logs = await baseClient.getLogs({
          address: BASE_USDC,
          event: TRANSFER_EVENT,
          args: { from: wallet, to: BASE_TREASURY },
          fromBlock: latest > span ? latest - span : 0n,
          toBlock: 'latest',
        });

        let best: { txHash: Hash; amount: bigint } | null = null;
        for (const log of logs) {
          const value = (log.args as { value?: bigint }).value;
          if (value === undefined || value < MIN_UNLOCK_USDC) continue;
          if (!best || value > best.amount) {
            best = { txHash: log.transactionHash as Hash, amount: value };
          }
        }
        if (best) return best;
      } catch {
        /* try a smaller block range */
      }
    }

    return null;
  } catch {
    return null;
  }
}
