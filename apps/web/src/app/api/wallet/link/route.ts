import { NextRequest, NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { isAddress, verifyMessage } from 'viem';
import {
  isFreshLinkMessage,
  parseLinkMessage,
} from '@/lib/linkMessage';
import { grantEntitlement, hasPaidAccess } from '@/lib/payments';
import { linkWallets } from '@/lib/walletLinks';

/**
 * Links a Solana address to an EVM address so one payment unlocks both.
 *
 * Ownership rule: an address is only granted access if it (or its partner)
 * already paid *and* the address being granted proved it controls its key.
 *  - Solana side: detached ed25519 signature over the link message.
 *  - EVM side: a `personal_sign` signature, required unless the EVM address
 *    itself has a paid entitlement (in that case the on-chain payment already
 *    proves ownership of the key).
 */
export async function POST(req: NextRequest) {
  try {
    const { solanaAddress, evmAddress, message, solanaSignature, evmSignature } =
      await req.json();

    if (!solanaAddress || !evmAddress || !message || !solanaSignature) {
      return NextResponse.json(
        {
          success: false,
          message: 'solanaAddress, evmAddress, message and solanaSignature are required.',
        },
        { status: 400 }
      );
    }

    if (!isAddress(evmAddress)) {
      return NextResponse.json(
        { success: false, message: 'That EVM address is not valid.' },
        { status: 400 }
      );
    }

    const parsed = parseLinkMessage(String(message));
    if (!parsed) {
      return NextResponse.json(
        { success: false, message: 'Unrecognised link message.' },
        { status: 400 }
      );
    }

    if (parsed.solana !== solanaAddress || parsed.evm.toLowerCase() !== evmAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'The signed message does not match these addresses.' },
        { status: 400 }
      );
    }

    if (!isFreshLinkMessage(parsed.issuedAt)) {
      return NextResponse.json(
        { success: false, message: 'That signature expired. Try again.' },
        { status: 400 }
      );
    }

    // Verify the Solana signature (ed25519, detached).
    let solanaValid = false;
    try {
      solanaValid = nacl.sign.detached.verify(
        new TextEncoder().encode(String(message)),
        bs58.decode(solanaSignature),
        bs58.decode(solanaAddress)
      );
    } catch {
      solanaValid = false;
    }

    if (!solanaValid) {
      return NextResponse.json(
        { success: false, message: 'That Solana signature did not verify.' },
        { status: 400 }
      );
    }

    const [solanaPaid, evmPaid] = await Promise.all([
      hasPaidAccess(solanaAddress),
      hasPaidAccess(evmAddress),
    ]);

    if (solanaPaid === 'unreachable' || evmPaid === 'unreachable') {
      return NextResponse.json(
        { success: false, message: 'Database unreachable. Try again in a moment.' },
        { status: 503 }
      );
    }

    if (!solanaPaid && !evmPaid) {
      return NextResponse.json(
        {
          success: false,
          message: 'No payment found for either wallet. Pay once, then link.',
        },
        { status: 403 }
      );
    }

    // The Solana key is already proven by the signature above. The EVM key is
    // only proven by a payment or by its own signature.
    let evmProven = Boolean(evmPaid);
    if (!evmProven && evmSignature) {
      try {
        evmProven = await verifyMessage({
          address: evmAddress,
          message: String(message),
          signature: evmSignature,
        });
      } catch {
        evmProven = false;
      }
    }

    if (!evmProven) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sign with the Base wallet too, so both addresses are proven.',
          needsEvmSignature: true,
        },
        { status: 403 }
      );
    }

    const linked = await linkWallets(solanaAddress, evmAddress);
    if (!linked) {
      return NextResponse.json(
        { success: false, message: 'Could not save the link. Try again.' },
        { status: 500 }
      );
    }

    // One payment now covers both identities, wherever they connect from.
    if (solanaPaid || evmPaid) {
      await grantEntitlement(solanaAddress);
      await grantEntitlement(evmAddress);
    }

    return NextResponse.json({
      success: true,
      message: 'Wallets linked. This payment now unlocks both addresses.',
      solanaAddress,
      evmAddress,
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
