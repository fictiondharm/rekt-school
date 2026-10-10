// One-time faucet setup for devnet:
// 1. Creates a faucet keypair (persisted to faucet-authority.json so re-runs reuse it)
//    or loads an existing FAUCET_MINT_AUTHORITY_SECRET from the environment
// 2. Airdrops it devnet SOL (with retries) so it can cover mint-authority account rent
// 3. Creates a brand-new fUSDC SPL mint owned by that keypair
// 4. Prints the exact values to paste into .env / .env.local
//
// Run from apps/web:  node scripts/setup-faucet.mjs
import { Keypair, Connection, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { createInitializeMintInstruction, MINT_SIZE, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load local .env / .env.local vars into process.env so the script uses the
// configured (possibly Helius/QuickNode keyed) devnet RPC, which allows airdrops.
for (const envFile of ['.env.local', '.env']) {
  try {
    const p = path.join(path.dirname(__dirname), envFile);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  } catch {
    // ignore
  }
}

const RPC = process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
const DECIMALS = 6;
const KEYFILE = path.join(__dirname, '..', 'faucet-authority.json');
const MINTFILE = path.join(__dirname, '..', 'faucet-mint.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureAirdrop(connection, pubkey, lamports, attempts = 6) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const sig = await connection.requestAirdrop(pubkey, lamports);
      const latest = await connection.getLatestBlockhash('confirmed');
      await connection.confirmTransaction({
        signature: sig,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      });
      console.log(`   Airdropped ${lamports / LAMPORTS_PER_SOL} SOL -> ${pubkey.toBase58().slice(0, 8)}...`);
      return true;
    } catch (err) {
      console.log(`   Attempt ${i}/${attempts} airdrop failed (${err.message}). Retrying in ${5 * i}s...`);
      await sleep(5000 * i);
    }
  }
  return false;
}

function loadOrCreateAuthority() {
  // 1) Prefer an explicitly provided secret
  const existingSecret = process.env.FAUCET_MINT_AUTHORITY_SECRET;
  if (existingSecret) {
    try {
      const arr = existingSecret.trim().startsWith('[')
        ? Uint8Array.from(JSON.parse(existingSecret))
        : bs58.decode(existingSecret);
      const kp = Keypair.fromSecretKey(arr);
      console.log(`Loaded faucet authority from env: ${kp.publicKey.toBase58()}`);
      return kp;
    } catch (err) {
      console.error(`Invalid FAUCET_MINT_AUTHORITY_SECRET: ${err.message}`);
      process.exit(1);
    }
  }
  // 2) Reuse a previously persisted keypair
  if (fs.existsSync(KEYFILE)) {
    const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(KEYFILE, 'utf8'))));
    console.log(`Loaded faucet authority from ${KEYFILE}: ${kp.publicKey.toBase58()}`);
    return kp;
  }
  // 3) Generate + persist
  const kp = Keypair.generate();
  fs.writeFileSync(KEYFILE, JSON.stringify(Array.from(kp.secretKey)), 'utf8');
  console.log(`Generated new faucet authority: ${kp.publicKey.toBase58()}`);
  console.log(`   Persisted keypair to: ${KEYFILE}`);
  return kp;
}

function loadOrCreateMint() {
  if (fs.existsSync(MINTFILE)) {
    const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(MINTFILE, 'utf8'))));
    console.log(`Loaded fUSDC mint from ${MINTFILE}: ${kp.publicKey.toBase58()}`);
    return kp;
  }
  const kp = Keypair.generate();
  fs.writeFileSync(MINTFILE, JSON.stringify(Array.from(kp.secretKey)), 'utf8');
  return kp;
}

async function main() {
  const connection = new Connection(RPC, 'confirmed');
  console.log(`Faucet setup on: ${RPC}\n`);

  const authority = loadOrCreateAuthority();

  // Step 2: ensure it has devnet SOL for rent
  let bal = await connection.getBalance(authority.publicKey);
  if (bal < 0.01 * LAMPORTS_PER_SOL) {
    console.log('Funding faucet authority with devnet SOL...');
    const ok = await ensureAirdrop(connection, authority.publicKey, 2 * LAMPORTS_PER_SOL);
    if (!ok) {
      console.log('\n======================== MANUAL FUNDING REQUIRED ========================');
      console.log(`Public devnet airdrop is rate-limited right now.`);
      console.log(`Send 2-3 devnet SOL to this wallet (e.g. from a prior claim / another airdrop):`);
      console.log(`  ${authority.publicKey.toBase58()}`);
      console.log(`Address it in the Solana Explorer: https://explorer.solana.com/address/${authority.publicKey.toBase58()}?cluster=devnet`);
      console.log('Then re-run: node scripts/setup-faucet.mjs');
      console.log('====================================================================');
      // still print keypair values so nothing is lost
      console.log('\nFaucet authority keypair (save this):');
      console.log(`FAUCET_MINT_AUTHORITY_SECRET=${bs58.encode(authority.secretKey)}`);
      process.exit(1);
    }
  } else {
    console.log(`Faucet authority balance: ${(bal / LAMPORTS_PER_SOL).toFixed(3)} SOL`);
  }

  // Re-check balance after funding loop before creating mint
  bal = await connection.getBalance(authority.publicKey);
  if (bal < 0.005 * LAMPORTS_PER_SOL) {
    console.error(`Faucet authority still has no SOL (balance ${bal}). Aborting mint creation.`);
    process.exit(1);
  }

  // Step 3: create the fUSDC mint owned by the faucet authority
  const mint = loadOrCreateMint();
  console.log(`\nfUSDC mint: ${mint.publicKey.toBase58()}`);

  // Idempotent: if the mint already exists on-chain with a matching authority, reuse it.
  try {
    const mintInfo = await connection.getParsedAccountInfo(mint.publicKey);
    if (mintInfo.value && 'parsed' in mintInfo.value.data) {
      const mintData = mintInfo.value.data.parsed.info;
      if (mintData.mintAuthority === authority.publicKey.toBase58()) {
        console.log('   Mint already exists on-chain. Skipping creation.');
        printEnvValues(authority, mint);
        return;
      }
    }
  } catch {
    // not found yet — fall through to creation
  }

  console.log('Creating mint...');
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: authority.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mint.publicKey,
      DECIMALS,
      authority.publicKey,
      authority.publicKey,
      TOKEN_PROGRAM_ID
    )
  );
  const latest = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = latest.blockhash;
  tx.feePayer = authority.publicKey;
  tx.sign(authority, mint);

  const sig = await connection.sendRawTransaction(tx.serialize());
  const conf = await connection.confirmTransaction({
    signature: sig,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  });
  if (conf.value.err) {
    console.error('Mint creation failed:', conf.value.err);
    process.exit(1);
  }
  console.log(`   Mint created! Explorer: https://explorer.solana.com/address/${mint.publicKey.toBase58()}?cluster=devnet`);

  printEnvValues(authority, mint);
}

function printEnvValues(authority, mint) {
  // Step 5: print exact .env values
  console.log('\n========== PASTE INTO .env AND apps/web/.env.local ==========');
  console.log(`FAUCET_MINT_AUTHORITY_SECRET=${bs58.encode(authority.secretKey)}`);
  console.log(`FUSDC_MINT=${mint.publicKey.toBase58()}`);
  console.log('==============================================================');
  console.log('\nTIP: add the FUSDC_MINT above to the course config so B7 swaps use the same fUSDC.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});