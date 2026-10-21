/**
 * Business details used across the legal pages, the footer and the payment
 * modal. Update these once and every page stays consistent.
 *
 * TODO(business): fill in the real values before going live.
 */
export const BUSINESS = {
  /** Trading / product name shown to customers. */
  name: 'Rekt School',
  /** Legal entity that issues the invoice. */
  legalName: 'Rekt School',
  /** Domain the service is operated from. */
  domain: 'rektschool.app',
  /** Support address shown on the contact page and in every legal page. */
  supportEmail: 'webdharme@gmail.com',
  /** Country that governs these terms. */
  jurisdiction: 'India',
  /** City used in the governing law clause. */
  city: 'Bengaluru',
  /** Last update date shown at the top of every legal page. */
  updatedAt: '2026-10-22',
} as const;

export const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/refunds', label: 'Refunds' },
  { href: '/contact', label: 'Contact' },
] as const;

/** One-off unlock price, in USD. */
export const COURSE_PRICE_USD = 1.49;
