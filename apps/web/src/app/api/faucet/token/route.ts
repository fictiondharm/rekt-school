import { NextRequest, NextResponse } from 'next/server';
import {
  PublicKey,
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import bs58 from 'bs58';
import { getServerSolanaConnection, COURSE_PROGRAM_IDS } from '@/lib/solana';
import { assertDevnetCluster } from '@/lib/cluster-guard';

// In-memory rate-limiter for the fUSDC faucet
const lastTokenClaim: Record<string, number> = {};

function loadMintAuthority(): Keypair | null {
  const raw = process.env.FAUCET_MINT_AUTHORITY_SECRET;
  if (!raw) return null;
  try {
    // Support both base58 secret string and JSON array of numbers
    if (raw.trim().startsWith('[')) {
      const arr = JSON.parse(raw);
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    }
    return Keypair.fromSecretKey(bs58.decode(raw));
  } catch (err) {
    console.warn('Failed to decode FAUCET_MINT_AUTHORITY_SECRET:', err);
    return null;
  }
}

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

    // Real minting requires a real connected wallet - no demo/mock fallbacks.
    let userPubkey: PublicKey;
    try {
      userPubkey = new PublicKey(wallet);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid Solana devnet address.' },
        { status: 400 }
      );
    }

    const authority = loadMintAuthority();
    if (!authority) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Faucet mint authority is not configured on the server. Set FAUCET_MINT_AUTHORITY_SECRET in .env to enable real fUSDC minting.',
        },
        { status: 503 }
      );
    }

    const now = Date.now();
    const last = lastTokenClaim[wallet] || 0;
    if (now - last < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - last)) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${waitSeconds}s before claiming more fUSDC.`,
        },
        { status: 429 }
      );
    }
    lastTokenClaim[wallet] = now;

    const connection = getServerSolanaConnection();
    const mintPubkey = new PublicKey(COURSE_PROGRAM_IDS.FUSDC_MINT);

    // Resolve token decimals from the on-chain mint account (default 6 for fUSDC/USDC)
    let decimals = 6;
    try {
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
      const parsed = mintInfo?.value?.data as
        | { parsed?: { info?: { decimals?: number } } }
        | undefined;
      if (parsed?.parsed?.info?.decimals != null) {
        decimals = parsed.parsed.info.decimals;
      }
    } catch {
      // fall back to 6
    }

    const amountBig = BigInt(Math.round(Number(amount) * 10 ** decimals));
    const userAta = getAssociatedTokenAddressSync(
      mintPubkey,
      userPubkey,
      false,
      TOKEN_PROGRAM_ID
    );

    const tx = new Transaction();

    // Create the user's ATA if it does not exist yet (rent paid via feePayer SOL).
    const ataInfo = await connection.getAccountInfo(userAta);
    if (!ataInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          userPubkey, // payer that funds the ATA rent
          userAta,
          userPubkey,
          mintPubkey,
          TOKEN_PROGRAM_ID
        )
      );
    }

    // Mint fUSDC into the user's ATA. Authority = server-controlled mint authority.
    tx.add(
      createMintToInstruction(
        mintPubkey,
        userAta,
        authority.publicKey,
        amountBig,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = userPubkey;

    // Server signs ONLY the mint-authority role.
    tx.partialSign(authority);

    // Serialize without requiring every signature so the user wallet can add its own.
    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({
      success: true,
      transaction: Buffer.from(serializedTx).toString('base64'),
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      amount: Number(amount),
      decimals,
      mint: mintPubkey.toBase58(),
      ca: mintPubkey.toBase58(),
      ata: userAta.toBase58(),
      feePayer: userPubkey.toBase58(),
    });
  } catch (err: unknown) {
    console.warn('Token faucet error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to prepare the fUSDC mint. Please try again.' },
      { status: 500 }
    );
  }
}