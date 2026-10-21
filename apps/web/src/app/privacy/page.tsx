import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { BUSINESS } from '@/lib/legal';

export const metadata = {
  title: 'Privacy Policy - Rekt School',
  description:
    'What data Rekt School collects, why we collect it, and the choices you have.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This policy explains what ${BUSINESS.name} collects, why we collect it, and what you can ask us to do about it.`}
      sections={[
        {
          heading: '1. What we collect',
          body: (
            <>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Account data</strong> — your email address and, if you
                  sign in, your user record.
                </li>
                <li>
                  <strong>Wallet data</strong> — the wallet address that pays,
                  the transaction hash of the payment, the amount, the asset and
                  the network. We never ask for and never store your private
                  keys or seed phrase.
                </li>
                <li>
                  <strong>Payment data</strong> — the payment reference, status
                  and timestamps. Card, UPI and netbanking credentials are
                  handled entirely by our payment provider.
                </li>
                <li>
                  <strong>Learning data</strong> — the lessons you open, the
                  steps you complete, quiz scores and your progress, so the
                  course can keep your place.
                </li>
                <li>
                  <strong>Technical data</strong> — IP address, browser and
                  device type, and pages visited, used for security and to
                  understand how the product is used.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: '2. Why we collect it',
          body: (
            <p>
              To deliver the course and keep your progress, to verify and record
              your payment and unlock access, to answer your support requests,
              to prevent fraud and abuse, and to improve the product. We rely on
              contractual necessity and legitimate interest for these purposes.
            </p>
          ),
        },
        {
          heading: '3. Payment processing',
          body: (
            <p>
              Payments are processed by third-party providers such as Razorpay.
              They act as independent controllers for the data needed to take
              and settle a payment, and their own privacy terms apply. We
              receive only what we need to confirm the payment, such as the
              payment id, amount, currency, status and the payer identifier.
            </p>
          ),
        },
        {
          heading: '4. Blockchain data',
          body: (
            <p>
              Crypto payments are recorded on a public blockchain. Your wallet
              address and the transaction are therefore publicly visible and
              permanent. We cannot delete them, and neither can we make them
              private.
            </p>
          ),
        },
        {
          heading: '5. Cookies and local storage',
          body: (
            <p>
              We store small amounts of data in your browser, such as a flag
              that unlocks the course on your device and your lesson progress.
              You can clear this data at any time; clearing it does not affect
              your purchase, because your unlock is tied to your wallet address.
            </p>
          ),
        },
        {
          heading: '6. Who we share it with',
          body: (
            <p>
              We share data only with the service providers that run the
              product: hosting, database, payment and email providers, each
              bound by contract to use the data only for that purpose. We do
              not sell your personal data.
            </p>
          ),
        },
        {
          heading: '7. How long we keep it',
          body: (
            <p>
              Payment records are kept for as long as required for accounting
              and legal obligations. Learning progress is kept while your
              account is active. Support messages are kept for two years.
            </p>
          ),
        },
        {
          heading: '8. Your rights',
          body: (
            <p>
              You can ask us for a copy of your data, ask us to correct or
              delete it, object to how we use it, or withdraw consent, where
              the law gives you those rights. Write to us and we will respond
              within 30 days. Deleting your account does not reverse a payment
              record we are legally required to keep.
            </p>
          ),
        },
        {
          heading: '9. Security',
          body: (
            <p>
              We encrypt data in transit, restrict access to the data that
              serves the product, and keep the service role database key on the
              server only. No system is perfectly secure, so please use a
              strong password and keep your wallet keys safe.
            </p>
          ),
        },
        {
          heading: '10. Children',
          body: (
            <p>
              The service is not directed at children under 18, and we do not
              knowingly collect their data.
            </p>
          ),
        },
        {
          heading: '11. Changes and contact',
          body: (
            <p>
              We may update this policy as the product changes; the date at the
              top always reflects the latest version. Privacy questions and
              requests go to{' '}
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
