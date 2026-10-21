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
  BookOpen,
  Skull,
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
          <div className="hidden sm:block absolute -top-20 -left-40 w-[500px] h-[500px] rounded-full bg-tertiary/30 pointer-events-none" aria-hidden="true" />
          {/* Confetti shapes (desktop only — kept off the mobile text column) */}
          <div className="hidden sm:block absolute top-8 right-10 w-6 h-6 bg-secondary rounded-full border-2 border-ink pointer-events-none" aria-hidden="true" />
          <div className="hidden sm:block absolute top-32 right-40 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-accent pointer-events-none" aria-hidden="true" />
          <div className="hidden sm:block absolute bottom-20 left-1/4 w-5 h-5 bg-quaternary border-2 border-ink rotate-45 pointer-events-none" aria-hidden="true" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-ink rounded-full text-[11px] font-bold uppercase tracking-widest shadow-pop-sm">
                  <span className="w-2 h-2 rounded-full bg-quaternary" />
                  Rekt School
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-ink leading-[1.05]">
                  Get rekt for{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10">₹149</span>
                    <span className="absolute -bottom-1 left-0 right-0 h-3 bg-tertiary -rotate-1 z-0" aria-hidden="true" />
                  </span>
                  {' '}before you get rekt for real.
                </h1>

                <p className="text-base sm:text-lg text-ink-soft leading-relaxed max-w-2xl">
                  Break AMMs, trigger liquidations, farm scams, and pull flash loans - all in a sandbox.{' '}
                  <strong className="text-ink">Learn the tricks that drain wallets</strong> before they drain yours.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Button
                    size="lg"
                    variant="primary"
                onClick={() => setPaymentModalOpen(true)}
                className="w-full sm:w-auto gap-2"
              >
                <Coins className="w-4 h-4" /> Get full access — ₹149
              </Button>
                  <Link href="/learn/b1" className="sm:w-auto">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                      <Play className="w-4 h-4" /> Try a free lesson first
                    </Button>
                  </Link>
                  <a
                    href="#pricing"
                    className="sm:ml-2 text-sm font-medium text-ink-soft hover:text-ink inline-flex items-center gap-1.5 self-center"
                  >
                    See what you unlock <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                {[
                  { icon: ShieldCheck, text: 'Solana Devnet + Sandbox', color: 'text-quaternary' },
                  { icon: Coins, text: 'All tiers unlocked', color: 'text-tertiary' },
                  { icon: KeyRound, text: 'Games, sims & war stories', color: 'text-secondary' },
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
                Tier 1 runs live on free Solana Devnet; Tiers 2 and 3 run in a pure sandbox. Either way: zero real funds.
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
                title: 'Real chain, zero risk',
                body: 'Tier 1 fires real transactions on Solana Devnet - connect Solflare or Phantom, mint tokens, verify it on a block explorer. Tiers 2 and 3 stress-test protocols in a safe sandbox.',
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
                One free lesson from every tier. Play all three right in your browser - no sign-up, no wallet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  A guided walkthrough of the layout: guided steps on the left, a live practice lab on
                  the right, spotlight tours, and tappable term definitions.
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
                  Toggle between shallow and ocean-deep pools, drag the trade size slider, and watch the
                  constant product curve (x · y = k) compute price impact live.
                </p>
              </div>
              <Link href="/learn/i1">
                <Button variant="yellow" className="w-full gap-2">
                  <FlaskConical className="w-4 h-4" /> Launch the Liquidity Lab
                </Button>
              </Link>
            </Card>

            <Card className="p-6 flex flex-col justify-between gap-6 hover:rotate-[-1deg] hover:scale-[1.02] transition-all duration-300 ease-bounce">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-tertiary text-ink text-xs font-bold rounded-full border-2 border-ink">P5</span>
                    <Badge variant="sandbox" className="text-[9px] px-2 py-0.5">Sandbox</Badge>
                  </div>
                  <span className="text-xs text-ink-faint font-mono">~18 min</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-ink">
                  Oracles &amp; flash loan attacks
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Watch a single bad price feed let an attacker drain a protocol in one block - then see
                  how a real oracle shuts the attack down.
                </p>
              </div>
              <Link href="/learn/p5">
                <Button variant="accent" className="w-full gap-2">
                  <Skull className="w-4 h-4" /> Launch P5
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* EMBEDDED SAMPLE SIMULATOR */}
        <section className="py-16 border-t-2 border-ink">
          <div className="max-w-2xl space-y-3 mb-8">
            <span className="inline-flex px-4 py-1.5 bg-tertiary text-ink text-[11px] font-bold uppercase tracking-widest border-2 border-ink rounded-full shadow-pop-sm">
              Live demo
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink">
              Watch price impact, live
            </h2>
            <p className="text-sm text-ink-soft">
              This plays on its own the moment it scrolls into view. Drag the slider or flip the pool
              any time to take over - and watch price impact explode in a thin pool.
            </p>
          </div>

          <div className="border-2 border-ink rounded-xl shadow-pop-lg overflow-hidden bg-white p-5 sm:p-8">
            <LiquidityLab autoPlay />
          </div>
        </section>

        {/* TWO NETWORKS / THREE TIERS */}
        <section className="py-16 border-t-2 border-ink">
          <div className="max-w-2xl space-y-3 mb-8">
            <span className="inline-flex px-4 py-1.5 bg-secondary text-white text-[11px] font-bold uppercase tracking-widest border-2 border-ink rounded-full shadow-pop-sm">
              Three tiers, zero risk
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink">
              Start easy. Finish dangerous.
            </h2>
            <p className="text-sm text-ink-soft">
              Every lesson shows a badge so you always know where you&apos;re practising - real Solana
              Devnet, or a pure sandbox.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <Badge variant="devnet">SOLANA DEVNET</Badge>
              <h3 className="font-heading font-bold text-lg text-ink">Tier 1 · Basic</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                Your first steps on the real thing. Connect Solflare or Phantom, claim free faucet SOL
                and 10,000 fUSDC, and send real transactions you can check on a block explorer.
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <Badge variant="sandbox">SANDBOX</Badge>
              <h3 className="font-heading font-bold text-lg text-ink">Tier 2 · Intermediate</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                The mechanics, hands-on. AMMs, impermanent loss, yield, lending and liquidations - in a
                pure sandbox where instant, zero-risk results let you push every curve to its breaking
                point.
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <Badge variant="sandbox">SANDBOX</Badge>
              <h3 className="font-heading font-bold text-lg text-ink">Tier 3 · Pro</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                The stuff that actually gets people rekt. Flash loans, oracle manipulation, MEV
                sandwiches, concentrated liquidity and a full smart-contract audit - finishing with a
                capstone where you architect a protocol.
              </p>
            </Card>
          </div>
        </section>

        {/* WAR STORIES + GLOSSARY */}
        <section className="py-16 border-t-2 border-ink">
          <div className="max-w-2xl space-y-3 mb-8">
            <span className="inline-flex px-4 py-1.5 bg-accent text-white text-[11px] font-bold uppercase tracking-widest border-2 border-ink rounded-full shadow-pop-sm">
              Beyond the lessons
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink">
              Real hacks, decoded
            </h2>
            <p className="text-sm text-ink-soft">
              The lessons teach the mechanics. These show you what happens when it all goes wrong.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 shadow-pop">
              <div className="w-11 h-11 rounded-full bg-danger/10 border-2 border-ink flex items-center justify-center">
                <Skull className="w-5 h-5 text-danger" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-ink">War Stories: real exploits</h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Wormhole, Mango, Cashio - walk through the actual attacks that drained millions. What
                  broke, why it broke, and the exact red flags to spot before it happens to you.
                </p>
              </div>
              <Link href="/war-stories">
                <Button variant="primary" className="w-full gap-2">
                  <Skull className="w-4 h-4" /> Read the case files
                </Button>
              </Link>
            </Card>

            <Card className="p-6 space-y-4 shadow-pop">
              <div className="w-11 h-11 rounded-full bg-accent/10 border-2 border-ink flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-ink">The DeFi glossary, in plain English</h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Every term you&apos;ll meet - TVL, slippage, health factor, MEV - explained without the
                  jargon. Tap any underlined word inside a lesson to see it defined, and never lose your place.
                </p>
              </div>
              <Link href="/glossary">
                <Button variant="yellow" className="w-full gap-2">
                  <BookOpen className="w-4 h-4" /> Open the glossary
                </Button>
              </Link>
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
            Unlock the full course to open Tier 2 (I1–I14) and Tier 3 (P1–P12).{' '}
            <Link href="/intermediate" className="text-accent font-semibold hover:underline">
              Browse Intermediate
            </Link>{' '}
            ·{' '}
            <Link href="/pro" className="text-accent font-semibold hover:underline">
              Browse Pro
            </Link>
          </p>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-16 border-t-2 border-ink scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex px-4 py-1.5 bg-quaternary text-ink text-[11px] font-bold uppercase tracking-widest border-2 border-ink rounded-full shadow-pop-sm">
                Early access
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink">
                Everything. One price. Learn to spot the rekt before it finds you.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'All lessons (Basic, Intermediate, Pro)',
                  'All DeFi sims and games',
                  'War Stories: real exploits decoded',
                  'Glossary + glossary tooltips',
                  'Solana Devnet labs + full sandbox',
                  'Aura tracking & progress',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-quaternary" />
                    <span className="text-sm text-ink">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <Card className="p-8 shadow-pop-lg relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-tertiary rounded-full border-2 border-ink flex items-center justify-center rotate-12">
                  <span className="text-xs font-bold">EARLY</span>
                </div>
                <div className="space-y-4">
                  <h3 className="font-heading font-extrabold text-2xl text-ink">Full access</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-heading font-extrabold text-ink">₹149</span>
                    <span className="text-lg text-ink-faint line-through mb-1">$5</span>
                  </div>
                  <p className="text-sm text-ink-soft">Early users lock in ₹149. Price goes up after launch.</p>
                  <Button size="lg" variant="primary" onClick={() => setPaymentModalOpen(true)} className="w-full gap-2">
                    <Coins className="w-4 h-4" /> Get full access for ₹149
                  </Button>
                  <div className="pt-4 border-t border-border space-y-3">
                    <p className="text-xs font-bold text-ink uppercase tracking-wider">FAQ</p>
                    <div className="space-y-2">
                      <p className="text-xs text-ink"><span className="font-bold">Do I need real crypto?</span> No. Use free Devnet funds or play in the sandbox.</p>
                      <p className="text-xs text-ink"><span className="font-bold">When does price go up?</span> After early access ends. Lock in now.</p>
                    </div>
                    <details className="text-xs text-ink">
                      <summary className="cursor-pointer font-semibold">Have a code?</summary>
                      <form onSubmit={handleRedeem} className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter code"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs font-mono bg-white rounded-lg border border-border focus:outline-none"
                        />
                        <Button type="submit" variant="secondary" size="sm" isLoading={isRedeeming}>Redeem</Button>
                      </form>
                      {redeemStatus && (
                        <p className={`mt-2 text-xs ${redeemStatus.success ? 'text-quaternary' : 'text-red-600'}`}>
                          {redeemStatus.message}
                        </p>
                      )}
                    </details>
                  </div>
                </div>
              </Card>
            </div>
          </div>
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
          </div>
        </footer>
      </main>
    </div>
  );
}
