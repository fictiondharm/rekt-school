import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { BUSINESS, COURSE_PRICE_USD } from '@/lib/legal';

export const metadata = {
  title: 'Terms & Conditions - Rekt School',
  description:
    'The terms that govern your use of Rekt School, our DeFi course and lesson platform.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={`These terms govern your use of ${BUSINESS.name} and our DeFi course. By creating an account, buying a lesson unlock or using the site, you agree to them.`}
      sections={[
        {
          heading: '1. What we offer',
          body: (
            <>
              <p>
                {BUSINESS.name} is an educational platform. We publish self-paced
                DeFi lessons, interactive exercises, a glossary and related
                learning material. A single one-time payment of{' '}
                {`$${COURSE_PRICE_USD.toFixed(2)}`} unlocks the complete lesson
                library for the wallet address used to pay.
              </p>
              <p>
                We are not a broker, fund, exchange, financial adviser or
                fiduciary. Nothing on the site is investment, tax, legal or
                financial advice.
              </p>
            </>
          ),
        },
        {
          heading: '2. Accounts and access',
          body: (
            <>
              <p>
                Keep your account credentials and wallet keys safe. You are
                responsible for everything done through your account and through
                wallets you connect to it.
              </p>
              <p>
                We may suspend or terminate an account that is used for
                fraud, resale of access, harassment, scraping, or any breach of
                these terms.
              </p>
            </>
          ),
        },
        {
          heading: '3. Purchases, pricing and taxes',
          body: (
            <>
              <p>
                The price shown at checkout is the total price for lifetime
                access to the lesson library, exclusive of any taxes that may
                apply. Taxes, where applicable, are added at checkout. The
                price can change for future purchases; it never changes for a
                purchase you already made.
              </p>
              <p>
                Payments are processed by our payment partners (for example
                Razorpay for UPI, cards and netbanking) and by the blockchain
                network for crypto payments. We never see or store your card or
                UPI credentials.
              </p>
            </>
          ),
        },
        {
          heading: '4. Crypto payments',
          body: (
            <>
              <p>
                Crypto payments are final. Blockchain transfers cannot be
                reversed by us or by you once broadcast, and network fees are
                set by the network. The amount we credit is the amount that
                arrives at our wallet, measured at the time the transaction is
                confirmed on-chain.
              </p>
              <p>
                Access is tied to the paying wallet address, so keep a record of
                it and back up the wallet that paid.
              </p>
            </>
          ),
        },
        {
          heading: '5. Refunds',
          body: (
            <>
              <p>
                Our refund policy is published on the{' '}
                <a href="/refunds" className="text-accent hover:underline">
                  Refunds page
                </a>
                . Because lessons are delivered instantly and can be consumed
                immediately, purchases are generally final once the lesson
                content has been accessed, except where the law requires
                otherwise, for duplicate payments, or where we failed to
                deliver access.
              </p>
            </>
          ),
        },
        {
          heading: '6. Acceptable use',
          body: (
            <>
              <p>
                Do not resell, share, scrape or attempt to bypass access
                controls; do not attack the service; do not use it to break the
                law; and do not post unlawful or abusive material.
              </p>
            </>
          ),
        },
        {
          heading: '7. Intellectual property',
          body: (
            <p>
              The lessons, exercises, glossary, design, brand and code of{' '}
              {BUSINESS.name} belong to us and our licensors. Buying access
              gives you a personal, non-transferable, non-exclusive licence to
              use the material for learning. It is not a resale right.
            </p>
          ),
        },
        {
          heading: '8. No financial advice and no guarantee',
          body: (
            <>
              <p>
                The material is educational and reflects our views at the time
                of writing. DeFi is experimental and technically complex;
                protocols can be exploited, lose money, rug-pull or be
                deprecated. You are solely responsible for your own decisions
                and for any loss resulting from them. We do not guarantee
                profit, price performance or the accuracy of third-party
                information we reference.
              </p>
            </>
          ),
        },
        {
          heading: '9. Limitation of liability',
          body: (
            <p>
              To the maximum extent permitted by law, our total liability
              arising from or relating to the service is limited to the amount
              you paid us in the twelve months before the event giving rise to
              the claim. We are not liable for indirect or consequential loss,
              including lost profits or lost crypto.
            </p>
          ),
        },
        {
          heading: '10. Changes to these terms',
          body: (
            <p>
              We may update these terms. Material changes are announced on this
              page with a new date, and continued use after that date means you
              accept the updated terms.
            </p>
          ),
        },
        {
          heading: '11. Governing law and contact',
          body: (
            <p>
              These terms are governed by the laws of {BUSINESS.jurisdiction},
              and the courts of {BUSINESS.city} have exclusive jurisdiction.
              Questions go to{' '}
              <a href={`mailto:${BUSINESS.supportEmail}`} className="text-accent hover:underline">
                {BUSINESS.supportEmail}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
