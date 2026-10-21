'use client';

import React, { useState } from 'react';
import { CandyButton } from '@/components/landing/CandyButton';
import { CheckItem } from '@/components/landing/CheckItem';
import { GhostButton } from '@/components/landing/GhostButton';
import { PaymentModal } from '@/components/onchain';
import { Badge } from '@/components/ui';
import { PRICING_COPY, TOTAL_LESSON_COUNT, UNLOCK_PRICE_INR, type PaymentMethod } from '@/lib/pricing';
import { startUpiCheckoutStub } from '@/lib/upiCheckout';
import { setCourseUnlocked } from '@/lib/unlock';
import { KeyRound } from 'lucide-react';

const FREE_FEATURES = ['3 lessons: B1, I1, P5', 'All 3 arcade games', 'War Stories & Glossary'];

const FULL_FEATURES = [
  `All ${TOTAL_LESSON_COUNT} lessons, every level`,
  'Pro labs: flash loans, MEV, perps',
  'Capstone: architect a protocol',
  'Future lessons & case files',
];

export function PricingSection() {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteStatus, setInviteStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [upiMessage, setUpiMessage] = useState<string | null>(null);

  const copy = PRICING_COPY[method];

  const handlePrimaryCta = async () => {
    if (method === 'crypto') {
      setPaymentModalOpen(true);
      return;
    }
    setUpiMessage(null);
    const result = await startUpiCheckoutStub({ amountInr: UNLOCK_PRICE_INR });
    if (!result.ok) setUpiMessage(result.message);
  };

  const handleRedeem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inviteCode.trim()) return;

    setRedeeming(true);
    setInviteStatus(null);

    try {
      const res = await fetch('/api/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setCourseUnlocked();
        setInviteStatus({ ok: true, message: 'Unlocked. Every lesson is open now.' });
        setInviteCode('');
      } else {
        setInviteStatus({ ok: false, message: data.message || 'Invalid invite code.' });
      }
    } catch {
      setInviteStatus({ ok: false, message: 'Network error verifying invite code.' });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <section
      id="pricing"
      className="relative mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col items-center gap-9 px-6 pb-28 pt-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-[120px] hidden h-[120px] w-[120px] rounded-full border-2 border-ink bg-quaternary desktop:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-36 left-16 hidden h-[72px] w-[72px] rotate-[20deg] border-2 border-ink bg-secondary desktop:block"
      />

      <div className="relative z-[1] flex max-w-[640px] flex-col items-center gap-3 text-center">
        <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-accent-strong">
          Pricing
        </div>
        <h2 className="m-0 font-heading text-[clamp(36px,4.4vw,56px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
          Cheaper than your first rug.
        </h2>
        <p className="m-0 text-lg leading-relaxed text-ink-soft">
          Pay once. Keep everything, including every lesson we add later.
        </p>
      </div>

      <div
        role="group"
        aria-label="Payment method"
        className="relative z-[1] flex gap-1.5 rounded-full border-2 border-ink bg-surface p-1.5"
      >
        {(['upi', 'crypto'] as PaymentMethod[]).map((option) => {
          const active = method === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setMethod(option)}
              className={`min-h-12 rounded-full border-2 px-5 py-2.5 text-[15px] font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent ${
                active
                  ? 'border-ink bg-accent-strong text-white'
                  : 'border-transparent bg-transparent text-ink'
              }`}
            >
              {option === 'upi' ? 'Pay with UPI' : 'Pay with crypto'}
            </button>
          );
        })}
      </div>

      <div className="relative z-[1] grid w-full max-w-[860px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-8">
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-ink bg-surface p-7 shadow-pop-lg">
          <div className="font-heading text-[22px] font-extrabold text-ink">Free</div>
          <div className="font-heading text-[52px] font-extrabold tracking-[-0.03em] text-ink">
            {copy.freePrice}
          </div>
          <div className="flex flex-col gap-2.5">
            {FREE_FEATURES.map((feature) => (
              <CheckItem key={feature}>{feature}</CheckItem>
            ))}
          </div>
          <GhostButton href="#free" className="mt-1.5">
            Start free
          </GhostButton>
        </div>

        <div className="relative flex flex-col gap-4 rounded-3xl border-2 border-ink bg-surface p-8 shadow-pop-accent-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-heading text-[22px] font-extrabold text-ink">Full access</span>
            <Badge variant="yellow" className="text-[13px] tracking-[0.04em]">
              PAY ONCE · KEEP FOREVER
            </Badge>
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-heading text-[60px] font-extrabold tracking-[-0.03em] text-ink">
              {copy.price}
            </span>
            <span className="font-medium text-ink-soft">{copy.priceNote}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {FULL_FEATURES.map((feature) => (
              <CheckItem key={feature} tone="mint">
                {feature}
              </CheckItem>
            ))}
          </div>
          <CandyButton onClick={handlePrimaryCta} className="mt-1.5 w-full">
            {copy.ctaLabel}
          </CandyButton>
          <div className="text-center text-sm font-medium text-ink-soft">{copy.payHint}</div>
          {upiMessage && (
            <p className="rounded-xl border-2 border-border bg-surface-muted px-3.5 py-2.5 text-center text-xs font-medium text-ink-soft">
              {upiMessage}
            </p>
          )}
        </div>
      </div>

      <div className="relative z-[1] w-full max-w-[860px] font-medium text-ink">
        Got an invite code?{' '}
        {inviteOpen ? (
          <form onSubmit={handleRedeem} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="pricing-invite-code" className="sr-only">
              Invite code
            </label>
            <input
              id="pricing-invite-code"
              type="text"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="REKT-XXXXXXXX"
              className="flex-1 rounded-full border-2 border-ink bg-surface px-4 py-3 font-mono text-sm uppercase text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
            />
            <button
              type="submit"
              disabled={redeeming}
              className="pop inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-ink bg-accent-strong px-5 text-sm font-bold text-white shadow-pop disabled:pointer-events-none disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              {redeeming ? 'Checking…' : 'Redeem code'}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="font-bold text-accent-strong underline underline-offset-2 hover:text-accent"
          >
            Redeem it
          </button>
        )}
        {inviteStatus && (
          <p
            className={`mt-2 text-sm font-medium ${
              inviteStatus.ok ? 'text-ink' : 'text-secondary-dark'
            }`}
          >
            {inviteStatus.message}
          </p>
        )}
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={() => {
          setCourseUnlocked();
        }}
      />
    </section>
  );
}
