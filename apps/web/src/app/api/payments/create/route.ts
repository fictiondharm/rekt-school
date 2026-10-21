import { NextRequest, NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';
import { UNLOCK_PRICE_USD } from '@/lib/pricing';

const pendingPayments: Record<string, { reference: string; amount: number; receiver: string; chain: string; createdAt: number }> = {};

export async function POST(req: NextRequest) {
  try {
    const { chain = 'solana-mainnet' } = await req.json();

    const referenceKeypair = Keypair.generate();
    const referencePubkey = referenceKeypair.publicKey.toBase58();

    const receiver =
      chain === 'base'
        ? '0x469a7cDbD8228fb1Eb29dA6A3D62949a880deaa2'
        : 'HtKPeixUAG5a28rxn4weDqyNfwb8BwSmEp7y7xfZHTf5';

    pendingPayments[referencePubkey] = {
      reference: referencePubkey,
      amount: UNLOCK_PRICE_USD,
      receiver,
      chain,
      createdAt: Date.now(),
    };

    return NextResponse.json({
      success: true,
      reference: referencePubkey,
      receiver,
      amount: UNLOCK_PRICE_USD,
      currency: 'USDC',
      chain,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
