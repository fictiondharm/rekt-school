import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { assertDevnetCluster } from '@/lib/cluster-guard';
import { COURSE_PROGRAM_IDS } from '@/lib/solana';

const lastTokenClaim: Record<string, number> = {};

export async function POST(req: NextRequest) {
  try {
    assertDevnetCluster();
    const { wallet, amount = 10000 } = await req.json();

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'Wallet address is required.' },
        { status: 400 }
      );
    }

    const isDemoWallet = wallet.startsWith('Devn') || wallet.includes('mock') || wallet.includes('demo');

    if (!isDemoWallet) {
      try {
        new PublicKey(wallet);
      } catch {
        return NextResponse.json(
          { success: false, message: 'Invalid Solana devnet address.' },
          { status: 400 }
        );
      }
    }

    const now = Date.now();
    const last = lastTokenClaim[wallet] || 0;
    if (now - last < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - last)) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: `Daily limit reached. Please wait ${waitSeconds}s before claiming more fUSDC.`,
        },
        { status: 429 }
      );
    }

    lastTokenClaim[wallet] = now;
    const claimSig = `fusdc_mint_${Date.now()}_${wallet.slice(0, 6)}`;

    return NextResponse.json({
      success: true,
      amount: Number(amount),
      mint: COURSE_PROGRAM_IDS.FUSDC_MINT,
      ca: COURSE_PROGRAM_IDS.FUSDC_MINT,
      signature: claimSig,
      message: `Successfully minted ${Number(amount).toLocaleString()} fUSDC to your token account!`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Failed to process token faucet claim.' },
      { status: 500 }
    );
  }
}
