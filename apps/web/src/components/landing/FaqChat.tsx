import React from 'react';

const QUESTIONS: { question: string; answer: string }[] = [
  {
    question: 'Do I need a crypto wallet?',
    answer:
      'Not to start. Labs and games run in your browser. Basic uses a free Phantom or Solflare wallet on Devnet, and we walk you through it.',
  },
  {
    question: 'Can I lose real money?',
    answer:
      'Never. Devnet tokens and sandbox balances are worth nothing. The only real money is the one-time unlock.',
  },
  {
    question: 'Is it really one payment?',
    answer: 'Yes. Pay once, keep every lesson, including the ones we add later.',
  },
  {
    question: 'I know nothing about crypto. Is this for me?',
    answer:
      'That’s exactly who Level 1 is for. It starts at “what is a wallet,” and every jargon word is tappable.',
  },
  {
    question: 'Who is this for?',
    answer:
      'People who read the hack headlines and want the mechanics, not the hype. No coding background needed. If you can use a browser and follow a few steps, you can finish this.',
  },
  {
    question: 'DeFi is the same everywhere. Why Solana?',
    answer:
      'The mechanics are identical everywhere: pools, oracles, liquidations. We picked Solana because failures are cheaper to replay, transactions are fast, and a Devnet faucet hands you real tokens worth nothing. Same lessons, smaller blast radius.',
  },
  {
    question: 'How long does the whole thing take?',
    answer:
      'Basic is roughly 84 minutes of reading and clicking. Intermediate and Pro go deeper, a few hours each. Every lesson is split into steps, so you can stop after one and pick it up later.',
  },
  {
    question: 'Can I try it before paying anything?',
    answer:
      'Yes. One lesson from every level plus all three arcade games are free and run in your browser. No wallet, no sign-up, no real money.',
  },
];

export function FaqChat() {
  return (
    <section
      aria-label="Questions"
      className="border-y-2 border-ink bg-surface"
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-6 py-24">
        <h2 className="mb-4 mt-0 font-heading text-[clamp(32px,3.8vw,48px)] font-extrabold tracking-[-0.03em] text-ink">
          Nina asks. Maxi answers.
        </h2>

        {QUESTIONS.map((item) => (
          <details key={item.question} className="flex flex-col">
            <summary className="flex cursor-pointer list-none items-end gap-3 [&::-webkit-details-marker]:hidden">
              <span
                aria-hidden="true"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-t-full border-2 border-ink bg-quaternary font-heading font-extrabold text-ink"
              >
                N
              </span>
              <span className="rounded-2xl rounded-bl-none border-2 border-ink bg-surface-muted px-4 py-3 text-[17px] font-bold text-ink">
                {item.question}
              </span>
            </summary>
            <div className="mt-2.5 flex justify-end">
              <p className="m-0 max-w-[520px] rounded-2xl rounded-br-none rounded-tl-2xl border-2 border-ink bg-accent-strong px-4 py-3 font-medium leading-relaxed text-white">
                {item.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
