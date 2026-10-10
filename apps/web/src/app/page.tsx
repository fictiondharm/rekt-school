'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '@/components/layout/TopBar';
import { Button, Card, Badge, Disclaimer } from '@/components/ui';
import { LiquidityLab } from '@/components/simulators/LiquidityLab';
import { PaymentModal } from '@/components/onchain';
import { canAccess, isAccessGateEnabled } from '@/lib/access';
import { getAllLessons } from '@/lib/content';
import {
  ArrowRight,
  ShieldCheck,
  Coins,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  Play,
  FlaskConical,
  Wallet,
} from 'lucide-react';

const basicLessons = getAllLessons()
  .filter((l) => l.tier === 'basic')
  .sort((a, b) => a.order - b.order);

const FREE_LESSON_IDS = new Set(
  getAllLessons().filter((l) => l.freePreview).map((l) => l.id)
);

export default function HomePage() {
  const [inviteCode, setInviteCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [hasUnlockedAll, setHasUnlockedAll] = useState(false);
  const [gateEnabled, setGateEnabled] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    setGateEnabled(isAccessGateEnabled());
    const savedUnlocked =
localStorage.getItem('defi_maxi_unlocked_all') === 'true' ||
        localStorage.getItem('defi_mommy_unlocked_all') === 'true' ||
        localStorage.getItem('defi_quest_unlocked_all') === 'true';
    if (savedUnlocked) setHasUnlockedAll(true);
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsRedeeming(true);
    setRedeemStatus(null);

    try {
      const res = await fetch('/api/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();
      setRedeemStatus({ success: data.success, message: data.message });

      if (data.success) {
        setHasUnlockedAll(true);
        localStorage.setItem('defi_maxi_unlocked_all', 'true');
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      setRedeemStatus({
        success: false,
        message: 'Network error submitting invite code. Please try again.',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar />

      <main className="w-full max-w-6xl mx-auto px-5 sm:px-8 flex-1">
        {/* HERO */}
        <section className="pt-14 sm:pt-24 pb-16 relative overflow-hidden">
          {/* Massive yellow circle behind text */}
          <div className="absolute -top-20 -left-40 w-[500px] h-[500px] rounded-full bg-tertiary/30 pointer-events-none" aria-hidden="true" />
          {/* Confetti shapes */}
          <div className="absolute top-8 right-10 w-6 h-6 bg-secondary rounded-full border-2 border-ink pointer-events-none" aria-hidden="true" />
          <div className="absolute top-32 right-40 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-accent pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-quaternary border-2 border-ink rotate-45 pointer-events-none" aria-hidden="true" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-ink rounded-full text-[11px] font-bold uppercase tracking-widest shadow-pop-sm">
                <span className="w-2 h-2 rounded-full bg-quaternary" />
                Rekt Academy
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-ink leading-[1.05]">
                Don&apos;t get rekt. Learn DeFi by{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">breaking it</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-tertiary -rotate-1 z-0" aria-hidden="true" />
                </span>{' '}
                on Devnet first.
              </h1>

              <p className="text-base sm:text-lg text-ink-soft leading-relaxed max-w-2xl">
                Two tiers, two networks. <strong className="text-ink">Tier 1 (Basic)</strong> runs live on
                Solana Devnet with a real wallet and free faucet money, while{' '}
                <strong className="text-ink">Tier 2 (Intermediate)</strong> drops you into pure simulation
                labs. Break constant-product AMMs, liquidation stress tests, token minting and wallet
                security — all with zero real cash at risk.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link href="/learn/b1" className="sm:w-auto">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2">
                    <Play className="w-4 h-4" /> Start the free lesson
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setPaymentModalOpen(true)}
                  className="w-full sm:w-auto gap-2"
                >
                  <Coins className="w-4 h-4" /> Unlock everything for $1
                </Button>
                <a
                  href="#curriculum"
                  className="sm:ml-2 text-sm font-medium text-ink-soft hover:text-ink inline-flex items-center gap-1.5 self-center"
                >
                  View curriculum <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                {[
                  { icon: ShieldCheck, text: 'Tier 1 Devnet · Tier 2 Sandbox', color: 'text-quaternary' },
                  { icon: Coins, text: '10,000 fUSDC faucet included', color: 'text-tertiary' },
                  { icon: KeyRound, text: 'Aura progress tracking', color: 'text-secondary' },
                ].map(({ icon: Icon, text, color }) => (
                  <span key={text} className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-ink rounded-full text-[13px] font-medium shadow-pop-sm">
                    <Icon className={`w-4 h-4 ${color}`} /> {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right decorative area - dotted pattern + hero image */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle,#E2E8F0_1.5px,transparent_1.5px)] bg-[length:20px_20px]" />
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-accent rounded-tl-[80px] rounded-tr-[80px] rounded-br-[80px] rounded-bl-none border-2 border-ink shadow-pop-lg overflow-hidden">
                  <Image
                    src="/brand/hero.png"
                    alt="Rekt School hero"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Golden rule note - speech bubble */}
          <div className="mt-12 max-w-2xl relative">
            <div className="bg-white border-2 border-ink rounded-tl-none rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 shadow-pop">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading font-bold text-sm text-ink">
                  Maxi&apos;s golden rule: learn on-chain before mainnet bites
                </h3>
                <Badge variant="pink">Zero real risk</Badge>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">
                In Web3, mistakes cost real money in milliseconds. Our motto:{' '}
                <span className="text-ink font-bold">
                  do it, see what happened, break it safely.
                </span>{' '}
                Tier 1 runs live on free Solana Devnet; Tier 2 runs in a pure sandbox. Either way: zero real funds.
              </p>
            </div>
            {/* Speech bubble tail */}
            <div className="absolute -top-3 left-8 w-6 h-6 bg-white border-l-2 border-t-2 border-ink transform rotate-45" aria-hidden="true" />
          </div>
        </section>

        {/* VALUE PILLARS - 3 cards with alternating colors */}
        <section className="py-16 relative">
          {/* Dashed connecting line */}
          <svg className="absolute top-1/2 left-0 right-0 h-4 w-full pointer-events-none hidden md:block" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1000 10">
            <line x1="100" y1="5" x2="900" y2="5" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              {
                n: '01',
                title: "Maxi's guided hand",
                body: 'No dry 50-page PDFs or confusing Discord threads. Tactical clues, glossary tooltips and step-by-step guidance for every on-chain challenge.',
                color: 'bg-accent',
                iconBg: 'bg-accent',
              },
              {
                n: '02',
                title: 'Don\u2019t get rekt',
                body: 'Crash test your trades. Suffer extreme slippage in shallow pools, trigger simulated liquidations, and spot drainers before they touch your savings.',
                color: 'bg-secondary',
                iconBg: 'bg-secondary',
              },
              {
                n: '03',
                title: 'Devnet + Sandbox mastery',
                body: 'Tier 1 fires real transactions on Solana Devnet (connect Solflare or Phantom, mint tokens, verify on a block explorer). Tier 2 stress-tests protocols in a safe sandbox.',
                color: 'bg-tertiary',
                iconBg: 'bg-tertiary',
              },
            ].map((pillar) => (
              <Card key={pillar.n} className="p-6 pt-8 relative hover:rotate-[-1deg] hover:scale-[1.02] transition-all duration-300 ease-bounce">
                {/* Floating circle icon half-in/half-out top border */}
                <div className={`absolute -top-4 left-6 w-8 h-8 rounded-full ${pillar.iconBg} border-2 border-ink flex items-center justify-center`}>
                  <span className="font-heading font-bold text-xs text-white">{pillar.n}</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-ink mt-2 mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">{pillar.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* FREE PREVIEWS */}
        <section className="py-16 border-t-2 border-ink">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-heading font-extrabold text-ink">Start here, free</h2>
                <Badge variant="mint">No wallet needed</Badge>
              </div>
              <p className="text-sm text-ink-soft mt-2">
                Two full lessons you can play immediately in your browser.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 flex flex-col justify-between gap-6 hover:rotate-[-1deg] hover:scale-[1.02] transition-all duration-300 ease-bounce">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full border-2 border-ink">B1</span>
                    <Badge variant="devnet" className="text-[9px] px-2 py-0.5">Devnet</Badge>
                  </div>
                  <span className="text-xs text-ink-faint font-mono">~5 min</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-ink">
                  Welcome: how this course works
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Master the dual-panel layout: guided curriculum on the left, live Devnet
                  sandbox on the right, plus spotlight tours and term definitions.
                </p>
              </div>
              <Link href="/learn/b1">
                <Button variant="primary" className="w-full gap-2">
                  <Play className="w-4 h-4" /> Launch lesson B1
                </Button>
              </Link>
            </Card>

            <Card className="p-6 flex flex-col justify-between gap-6 hover:rotate-[-1deg] hover:scale-[1.02] transition-all duration-300 ease-bounce shadow-pop-pink">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full border-2 border-ink">I1</span>
                    <Badge variant="sandbox" className="text-[9px] px-2 py-0.5">Sandbox</Badge>
                  </div>
                  <span className="text-xs text-ink-faint font-mono">~8 min</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-ink">
                  The Liquidity Lab: how pools really work
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Toggle between shallow and ocean-deep pools, drag the trade size slider,
                  and watch the constant product curve (x*y=k) compute price impact live.
                </p>
              </div>
              <Link href="/learn/i1">
                <Button variant="yellow" className="w-full gap-2">
                  <FlaskConical className="w-4 h-4" /> Launch the Liquidity Lab
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* EMBEDDED SAMPLE SIMULATOR */}
        <section className="py-16 border-t-2 border-ink">
          <div className="max-w-2xl space-y-3 mb-8">
            <span className="inline-flex px-4 py-1.5 bg-tertiary text-ink text-[11px] font-bold uppercase tracking-widest border-2 border-ink rounded-full shadow-pop-sm">
              Interactive preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink">
              Feel price impact before it costs you money
            </h2>
            <p className="text-sm text-ink-soft">
              Drag the trade slider to see how price impact escalates in thin pools.
            </p>
          </div>

          <div className="border-2 border-ink rounded-xl shadow-pop-lg overflow-hidden bg-white p-5 sm:p-8">
            <LiquidityLab />
          </div>
        </section>

        {/* WALLET SETUP */}
        <section className="py-16 border-t-2 border-ink">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-quaternary border-2 border-ink flex items-center justify-center">
              <Wallet className="w-5 h-5 text-ink" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-ink">
              New to Web3? A free Devnet wallet in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Install Solflare or Phantom',
                body: (
                  <>
                    Add <a href="https://solflare.com" target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline">Solflare</a> or{' '}
                    <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline">Phantom</a>{' '}
                    as a browser extension. Create a fresh test wallet and store the recovery
                    phrase securely.
                  </>
                ),
                color: 'bg-accent',
              },
              {
                title: 'Switch the network to Solana Devnet',
                body: (
                  <>
                    Open Settings, then Developer Settings in your wallet and set the network to{' '}
                    <strong className="font-bold text-ink">Devnet</strong>. Every transaction
                    you send from here uses free test money.
                  </>
                ),
                color: 'bg-secondary',
              },
              {
                title: 'Claim 10,000 fUSDC and test SOL',
                body: (
                  <>
                    Connect your wallet, use the one-click faucet, copy the contract address
                    into your wallet to see the balance, and start learning.
                  </>
                ),
                color: 'bg-tertiary',
              },
            ].map((step, i) => (
              <Card key={step.title} className="p-6 pt-8 relative hover:rotate-[-1deg] hover:scale-[1.02] transition-all duration-300 ease-bounce">
                <div className={`absolute -top-4 left-6 w-8 h-8 rounded-full ${step.color} border-2 border-ink flex items-center justify-center`}>
                  <span className="font-heading font-bold text-xs text-white">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h4 className="font-heading font-bold text-base text-ink mt-2 mb-3">{step.title}</h4>
                <p className="text-sm text-ink-soft leading-relaxed">{step.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* TWO NETWORKS */}
        <section className="py-16 border-t-2 border-ink">
          <div className="max-w-2xl space-y-3 mb-8">
            <span className="inline-flex px-4 py-1.5 bg-secondary text-white text-[11px] font-bold uppercase tracking-widest border-2 border-ink rounded-full shadow-pop-sm">
              Two tiers, two networks
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink">
              One course, two ways to practice
            </h2>
            <p className="text-sm text-ink-soft">
              Every lesson shows a badge telling you exactly which environment you are in.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3">
              <Badge variant="devnet">SOLANA DEVNET</Badge>
              <h3 className="font-heading font-bold text-lg text-ink">Tier 1 · Basic</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                Live on the real <strong className="text-ink">Solana Devnet</strong> testnet. Connect Solflare or
                Phantom, claim free faucet SOL and 10,000 fUSDC, and broadcast real (but free) transactions you
                can verify on a block explorer.
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <Badge variant="sandbox">SANDBOX</Badge>
              <h3 className="font-heading font-bold text-lg text-ink">Tier 2 · Intermediate</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                A pure in-browser <strong className="text-ink">sandbox</strong>. No wallet and no real chain —
                manipulate AMM curves, interest rates, liquidations and tokenomics with instant, zero-risk
                results.
              </p>
            </Card>
          </div>
        </section>

        {/* CURRICULUM */}
        <section id="curriculum" className="py-16 border-t-2 border-ink scroll-mt-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-ink">
                Full curriculum, Tier 1: Basic
              </h2>
              <p className="text-sm text-ink-soft mt-2">
                From wallet basics to launching your own token and swapping on an AMM.
              </p>
            </div>

            {hasUnlockedAll ? (
              <Badge variant="mint" className="gap-1.5 py-1.5 px-3">
                <Unlock className="w-3.5 h-3.5" /> All lessons unlocked
              </Badge>
            ) : gateEnabled ? (
              <Badge variant="yellow" className="gap-1.5 py-1.5 px-3">
                <Lock className="w-3.5 h-3.5" /> Free previews open
              </Badge>
            ) : (
              <Badge variant="accent" className="gap-1.5 py-1.5 px-3">
                Dev mode: all open
              </Badge>
            )}
          </div>

          <div className="border-2 border-ink rounded-xl shadow-pop-lg overflow-hidden bg-white">
            {basicLessons.map((lesson) => {
              const isFree = FREE_LESSON_IDS.has(lesson.id);
              const access = canAccess(
                hasUnlockedAll ? { hasRedeemedCode: true } : null,
                { id: lesson.id, freePreview: isFree }
              );

              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.id.toLowerCase()}`}
                  className="group grid grid-cols-[3rem_1fr] sm:grid-cols-[3.5rem_1fr_auto] items-start sm:items-center gap-x-4 gap-y-2 py-4 px-5 border-b border-border last:border-b-0 hover:bg-tertiary/20 transition-colors"
                >
                  <span className="font-mono text-[13px] text-ink-faint group-hover:text-accent transition-colors pt-0.5 sm:pt-0">
                    {lesson.id}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-sm text-ink">
                        {lesson.title}
                      </h3>
                      {isFree && <Badge variant="mint" className="text-[10px] py-0.5 px-2">Free</Badge>}
                    </div>
                    <p className="text-[13px] text-ink-soft leading-relaxed mt-0.5 truncate">
                      {lesson.objectives[0]}
                    </p>
                  </div>

                  <div className="col-start-2 sm:col-start-3 flex items-center gap-4 justify-self-start sm:justify-self-end">
                    <span className="text-xs text-ink-faint font-mono">
                      {lesson.estMinutes} min
                    </span>
                    {access.allowed ? (
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-ink flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                        <Lock className="w-3 h-3 text-ink-faint" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="text-xs text-ink-faint mt-4">
            Intermediate labs (I1 to I10) unlock with the full course.
          </p>
        </section>

        {/* INVITE CODE */}
        <section className="py-16 border-t-2 border-ink">
          <Card className="p-8 shadow-pop">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary border-2 border-ink flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-ink" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-ink">
                    Have an invite code?
                  </h3>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Have a code from us? Enter it to unlock the full course for free — no payment
                  needed. Otherwise, get instant access for $1 USDC on Solana or Base.
                </p>
                <p className="text-xs text-ink-faint">
                  No code yet? Ask the owner to send you one so you can unlock without paying.
                </p>
              </div>

              <form
                onSubmit={handleRedeem}
                className="w-full md:w-auto flex flex-col sm:flex-row gap-3 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Enter invite code"
                  aria-label="Invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="px-4 py-3 text-sm font-mono bg-white rounded-lg border-2 border-border focus:ring-4 focus:ring-accent/30 focus:border-accent focus:outline-none w-full sm:w-56 transition-all"
                />
                <Button type="submit" variant="primary" isLoading={isRedeeming} className="shrink-0">
                  Redeem
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPaymentModalOpen(true)}
                  className="shrink-0"
                >
                  Unlock for $1
                </Button>
              </form>
            </div>

            {redeemStatus && (
              <div
                className={`mt-5 p-4 rounded-xl text-sm flex items-center gap-3 border-2 ${
                  redeemStatus.success
                    ? 'bg-quaternary/20 text-ink border-quaternary'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}
              >
                {redeemStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 shrink-0" />
                )}
                <span>{redeemStatus.message}</span>
              </div>
            )}
          </Card>
        </section>

        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            setHasUnlockedAll(true);
            localStorage.setItem('defi_maxi_unlocked_all', 'true');
            window.dispatchEvent(new Event('storage'));
          }}
        />

        {/* FOOTER */}
        <footer className="py-12 space-y-6">
          <Disclaimer />
          <div className="text-xs text-ink-faint flex flex-wrap gap-x-4 gap-y-1">
            <span className="font-bold text-ink">Rekt School</span>
            <span>Solana Devnet &amp; Sandbox educational academy</span>
            <span>Non-custodial, zero financial advice</span>
            <span>Built for Solana Hackathon 2026</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
