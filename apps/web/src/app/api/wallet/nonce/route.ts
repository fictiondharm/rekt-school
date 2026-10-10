import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const message = `Welcome to Rekt School!\n\nPlease sign this message to link your wallet securely.\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

    return NextResponse.json({ nonce, message });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 });
  }
}

