import { createPublicClient, http, parseUnits, type Address, type Hash } from 'viem';
import { base } from 'viem/chains';

export const BASE_USDC = '0x833589fCD1eD18E646dC60844d597A8678760cD0' as Address;
export const BASE_TREASURY = '0x469a7cDbD8228fb1Eb29dA6A3D62949a880deaa2' as Address;

export const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

export const USDC_DECIMALS = 6;
export const ONE_USDC = parseUnits('1', USDC_DECIMALS);

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
        value >= ONE_USDC
      ) {
        return { valid: true, from, amount: value };
      }
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}
