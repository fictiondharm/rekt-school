'use client';

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
} from '@solana/web3.js';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import { Card, Button, Badge } from '@/components/ui';
import { OfficialFaucetGuide } from '@/components/onchain/OfficialFaucetGuide';
import {
  Rocket,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Coins,
  ArrowRight,
  HelpCircle,
  Code2,
  Lock,
} from 'lucide-react';

export function B6Companion() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('Solana Chad');
  const [symbol, setSymbol] = useState('CHAD');
  const [supply, setSupply] = useState(10000);
  const [decimals, setDecimals] = useState(6);
  const [revokeAuthority, setRevokeAuthority] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mintedCA, setMintedCA] = useState<string | null>(null);
  const [mintTxSig, setMintTxSig] = useState<string | null>(null);
  const [copiedCA, setCopiedCA] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [showUnderTheHood, setShowUnderTheHood] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleMintRealToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setMintedCA(null);
    setMintTxSig(null);

    // If no real wallet connected, run high-fidelity simulated deployment
    if (!connected || !publicKey) {
      setTimeout(() => {
        const mockMint = Keypair.generate().publicKey.toBase58();
        setMintedCA(mockMint);
        setMintTxSig(`sim_${Date.now()}_mint_${mockMint.slice(0, 8)}`);
        setIsSimulatedMode(true);
        setLoading(false);
      }, 1200);
      return;
    }

    try {
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;

      // 1. Calculate rent for Mint account
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      // 2. Derive User's Associated Token Account
      const userATA = getAssociatedTokenAddressSync(
        mintPublicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      const tx = new Transaction();

      // Allocate storage
      tx.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPublicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Initialize Mint
      tx.add(
        createInitializeMintInstruction(
          mintPublicKey,
          decimals,
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      // Create User ATA
      tx.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          userATA,
          publicKey,
          mintPublicKey,
          TOKEN_PROGRAM_ID
        )
      );

      // Mint initial supply
      const mintAmount = BigInt(supply) * BigInt(10 ** decimals);
      tx.add(
        createMintToInstruction(
          mintPublicKey,
          userATA,
          publicKey,
          mintAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Optional: Revoke Mint Authority to lock supply
      if (revokeAuthority) {
        tx.add(
          createSetAuthorityInstruction(
            mintPublicKey,
            publicKey,
            AuthorityType.MintTokens,
            null,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      // Partial sign with mint keypair
      tx.partialSign(mintKeypair);

      const signature = await sendTransaction(tx, connection);
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Devnet token deployment failed.');
      }

      setMintedCA(mintPublicKey.toBase58());
      setMintTxSig(signature);
      setIsSimulatedMode(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Token minting was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCA = () => {
    if (!mintedCA) return;
    navigator.clipboard.writeText(mintedCA);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="space-y-1">
        <Badge variant="primary" className="mb-1">
          LAB B6 • SPL TOKEN LAUNCHER
        </Badge>
        <h3 className="font-heading font-semibold text-xl text-ink">
          Deploy Your SPL Token & Contract Address (CA)
        </h3>
        <p className="text-xs text-ink-soft">
          Configure token parameters, mint supply, and automatically receive your token's unique Contract Address.
        </p>
      </div>

      {mounted && !connected && (
        <OfficialFaucetGuide />
      )}

      <Card className="p-6 space-y-5 bg-surface border border-border shadow-sm">
        <form onSubmit={handleMintRealToken} className="space-y-4 text-xs">
          <div>
            <label className="font-heading font-semibold text-ink block mb-1">
              Token Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-button bg-bg border border-border text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
              placeholder="e.g. Solana Chad"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-heading font-semibold text-ink block mb-1">
                Ticker Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full p-2.5 rounded-button bg-bg border border-border font-mono text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                placeholder="e.g. CHAD"
                required
              />
            </div>
            <div>
              <label className="font-heading font-semibold text-ink block mb-1">
                Initial Supply
              </label>
              <input
                type="number"
                value={supply}
                onChange={(e) => setSupply(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 rounded-button bg-bg border border-border font-mono text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                min="1"
                required
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-bg border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-heading font-semibold text-ink flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Revoke Mint Authority (Fixed Supply)
              </span>
              <span className="text-[11px] text-ink-soft block">
                Permanently disables creating more tokens after this initial {supply.toLocaleString()} supply.
              </span>
            </div>
            <input
              type="checkbox"
              checked={revokeAuthority}
              onChange={(e) => setRevokeAuthority(e.target.checked)}
              className="w-4 h-4 text-primary accent-primary cursor-pointer"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full gap-2 text-xs py-3 shadow-sm"
          >
            <Rocket className="w-4 h-4" />
            {loading
              ? 'Deploying Token Contract...'
              : connected
              ? `Deploy & Mint ${supply.toLocaleString()} ${symbol} to Wallet`
              : `Deploy & Mint ${supply.toLocaleString()} ${symbol} (Sandbox Mode)`}
          </Button>
        </form>

        {/* REAL MINTED CONTRACT ADDRESS (CA) RESULT CARD */}
        {mintedCA && (
          <div className="p-5 rounded-xl bg-accent-light border border-accent/40 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-heading font-semibold text-sm text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Token Created & Initialized!
              </div>
              <Badge variant="accent" className="text-[10px]">
                {supply.toLocaleString()} {symbol} Minted {isSimulatedMode ? '(Simulated)' : '(Devnet)'}
              </Badge>
            </div>

            {/* CONTRACT ADDRESS (CA) BOX */}
            <div className="p-3.5 bg-surface rounded-xl border border-accent/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-ink flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-primary" /> Token Contract Address (CA):
                </span>
                <button
                  type="button"
                  onClick={handleCopyCA}
                  className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                >
                  {copiedCA ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCA ? 'Copied CA!' : 'Copy CA'}
                </button>
              </div>
              <div className="font-mono text-xs text-primary font-semibold break-all select-all bg-bg p-2 rounded-lg border border-border">
                {mintedCA}
              </div>
            </div>

            {/* WHY CA MATTERS CALLOUT */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <strong className="block text-amber-950">Why is this Contract Address (CA) so important?</strong>
              <p className="leading-relaxed">
                In Web3, anyone can create a coin with the name "{name}" and symbol "{symbol}". The <strong>Contract Address (CA)</strong> is the only permanent, cryptographic identifier that proves authenticity. Traders paste the CA into Jupiter or DexScreener to avoid imposters.
              </p>
            </div>

            {/* WALLET IMPORT TUTORIAL */}
            <div className="p-3.5 bg-bg rounded-xl border border-border space-y-2 text-xs">
              <div className="font-medium text-ink flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-primary" />
                How to View Your New Tokens in Phantom or Solflare:
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-ink-soft text-[11px] leading-relaxed">
                <li>Click <strong>Copy CA</strong> above to copy your new token's mint address.</li>
                <li>Open your Phantom or Solflare browser extension.</li>
                <li>Scroll to the bottom of your token balance list and click <strong>Manage Token List</strong> (or <strong>+</strong>).</li>
                <li>Paste your CA in the search bar.</li>
                <li>Click <strong>Import</strong>: your wallet will now show {name} ({symbol}) with your {supply.toLocaleString()} balance!</li>
              </ol>
            </div>

            {/* UNDER THE HOOD EXPLANATION */}
            <div className="pt-2 border-t border-accent/30">
              <button
                type="button"
                onClick={() => setShowUnderTheHood(!showUnderTheHood)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showUnderTheHood ? 'Hide technical explanation' : 'Under the Hood: How did Solana create this token?'}</span>
              </button>

              {showUnderTheHood && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-surface border border-border text-[11px] text-ink-soft space-y-2 animate-in fade-in duration-150">
                  <p className="font-semibold text-ink">Behind the scenes, Solana executed 5 core smart contract instructions:</p>
                  <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                    <li><strong>Rent Exemption:</strong> Paid ~0.0014 SOL to store 82 bytes for the master Mint account.</li>
                    <li><strong>Initialize Mint:</strong> Specified {decimals} decimals and registered your wallet as the mint creator.</li>
                    <li><strong>Derive ATA:</strong> Created an Associated Token Account (PDA) owned by your wallet to hold your token balance.</li>
                    <li><strong>Mint Tokens:</strong> Cryptographically printed {supply.toLocaleString()} units directly into your ATA.</li>
                    <li><strong>Revoke Authority:</strong> {revokeAuthority ? 'Set mint authority to null, locking supply permanently.' : 'Kept mint authority active so you can print more.'}</li>
                  </ol>
                </div>
              )}
            </div>

            {!isSimulatedMode && mintTxSig && (
              <div className="pt-2 border-t border-accent/30 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-ink-soft truncate max-w-[200px]">
                  Tx: {mintTxSig}
                </span>
                <a
                  href={`https://explorer.solana.com/address/${mintedCA}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-medium text-primary hover:underline text-xs"
                >
                  View on Solana Explorer <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
