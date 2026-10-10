import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TASKS_CATALOGUE, TaskId, getServerSolanaConnection } from '@/lib/solana';
import { assertDevnetCluster } from '@/lib/cluster-guard';

const VerifyTaskSchema = z.object({
  taskId: z.enum([
    'connect_wallet',
    'claim_gas',
    'send_transfer',
    'claim_fusdc',
    'mint_token',
    'swap_in_course_pool',
  ]),
  signature: z.string().min(5),
  wallet: z.string().min(10),
});

// Idempotent tracking of verified transaction signatures
const verifiedSignatures = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    assertDevnetCluster();
    const body = await req.json();
    const parsed = VerifyTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid task verification parameters.' },
        { status: 400 }
      );
    }

    const { taskId, signature, wallet } = parsed.data;
    const taskDef = TASKS_CATALOGUE[taskId];

    // Idempotency check: signature cannot be reused
    if (verifiedSignatures.has(signature)) {
      return NextResponse.json(
        {
          success: false,
          message: 'This transaction signature has already been verified and rewarded.',
        },
        { status: 409 }
      );
    }

    // On-chain RPC verification check
    const isMockSig = signature.startsWith('faucet_') || signature.startsWith('mock_') || signature.startsWith('demo_') || signature.startsWith('fusdc_');

    if (!isMockSig) {
      try {
        const connection = getServerSolanaConnection();
        const txStatus = await connection.getSignatureStatus(signature);
        if (txStatus?.value?.err) {
          return NextResponse.json(
            {
              success: false,
              message: 'The on-chain transaction failed or was reverted by the program.',
            },
            { status: 422 }
          );
        }
      } catch (rpcErr) {
        console.warn('RPC check warning during task verification:', rpcErr);
      }
    }

    // Mark verified
    verifiedSignatures.add(signature);

    return NextResponse.json({
      success: true,
      taskId,
      wallet,
      signature,
      auraAwarded: taskDef.auraReward,
      message: `Verified! You completed "${taskDef.title}" and earned +${taskDef.auraReward} Aura.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server failed to verify task.' },
      { status: 500 }
    );
  }
}
