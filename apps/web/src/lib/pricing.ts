/**
 * Single source of truth for what the course costs.
 *
 * Every price surface (homepage pricing section, lesson paywall, payment modal,
 * on-chain verification routes) reads these constants so the numbers can never
 * drift apart.
 */

/** One-time unlock price in USD. */
export const UNLOCK_PRICE_USD = 1.49;

/** One-time unlock price in INR. */
export const UNLOCK_PRICE_INR = 149;

/** USDC amount as a decimal string, for wallets and gateways. */
export const UNLOCK_USDC_AMOUNT = '1.49';

/** USDC amount in base units (USDC has 6 decimals). */
export const UNLOCK_USDC_BASE_UNITS = 1_490_000;

/** Lesson ids that are free for everyone, no unlock required. */
export const FREE_LESSON_IDS = ['B1', 'I1', 'P5'] as const;

/** Lesson counts per level. Keep in sync with the lesson JSON registry. */
export const LESSON_COUNTS = {
  basic: 10,
  intermediate: 14,
  pro: 12,
} as const;

/** Total number of lessons in the course. */
export const TOTAL_LESSON_COUNT =
  LESSON_COUNTS.basic + LESSON_COUNTS.intermediate + LESSON_COUNTS.pro;

export type PaymentMethod = 'upi' | 'crypto';

export interface PricingCopy {
  freePrice: string;
  price: string;
  priceNote: string;
  ctaLabel: string;
  payHint: string;
}

export const PRICING_COPY: Record<PaymentMethod, PricingCopy> = {
  upi: {
    freePrice: '₹0',
    price: `₹${UNLOCK_PRICE_INR}`,
    priceNote: `one-time · ~₹${Math.round(UNLOCK_PRICE_INR / TOTAL_LESSON_COUNT)} a lesson`,
    ctaLabel: `Unlock with UPI · ₹${UNLOCK_PRICE_INR}`,
    payHint: 'GPay, PhonePe, Paytm or any UPI app',
  },
  crypto: {
    freePrice: '$0',
    price: `$${UNLOCK_PRICE_USD.toFixed(2)}`,
    priceNote: 'USDC · one-time',
    ctaLabel: `Unlock with USDC · $${UNLOCK_PRICE_USD.toFixed(2)}`,
    payHint: 'USDC on Solana or Base',
  },
};

/** Short label for the unlock price, used in buttons and copy. */
export function unlockPriceLabel(method: PaymentMethod): string {
  return method === 'upi' ? `₹${UNLOCK_PRICE_INR}` : `$${UNLOCK_PRICE_USD.toFixed(2)}`;
}
