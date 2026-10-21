import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { BUSINESS, COURSE_PRICE_USD } from '@/lib/legal';

export const metadata = {
  title: 'Refund Policy - Rekt School',
  description:
    'When a Rekt School purchase can be refunded, how to request one, and how long it takes.',
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      intro={`A plain-English version of what happens to your ${`$${COURSE_PRICE_USD.toFixed(2)}`} payment if something goes wrong.`}
      sections={[
        {
          heading: '1. The short version',
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Duplicate or wrongly charged payment — we refund it in full.</li>
              <li>You never got access after a successful payment — we fix it or refund it.</li>
              <li>You bought by mistake and have not opened a single lesson — we refund it on request within 7 days.</li>
              <li>You used the lessons — no refund, because the product was delivered.</li>
              <li>Crypto payments — refunds are only possible in the cases above, because on-chain transfers cannot be reversed.</li>
            </ul>
          ),
        },
        {
          heading: '2. Digital content and instant access',
          body: (
            <p>
              Access is delivered immediately after a successful payment, and
              lessons can be read straight away. Because the content is
              available to you immediately and can be consumed in full, sales
              are treated as completed on delivery. We still refund where the
              content is materially broken, where you were charged twice, or
              where you were charged for something we never delivered.
            </p>
          ),
        },
        {
          heading: '3. Requesting a refund',
          body: (
            <>
              <p>
                Email us from the address you used to buy, or from the email
                linked to your account, with the word "refund" in the subject
                and the wallet address or payment id you paid with. Include the
                date and amount. We reply within 2 business days.
              </p>
              <p>
                <a href={`mailto:${BUSINESS.supportEmail}?subject=Refund%20request`} className="text-accent hover:underline">
                  {BUSINESS.supportEmail}
                </a>
              </p>
            </>
          ),
        },
        {
          heading: '4. How refunds are paid back',
          body: (
            <>
              <p>
                UPI, card and netbanking payments are refunded to the original
                payment method. Banks usually take 5 to 10 business days to
                credit the amount.
              </p>
              <p>
                Crypto payments are refunded in the same asset, to a wallet
                address you provide, minus the network fee of the refund
                transaction. We cannot return funds to a card or bank account
                for a payment that was made on-chain.
              </p>
            </>
          ),
        },
        {
          heading: '5. Chargebacks and fraudulent payments',
          body: (
            <p>
              If a payment is reversed by your bank as a chargeback, access is
              suspended and the amount becomes payable to us. We do not charge a
              fee for reversing a chargeback, only the amount that was charged.
            </p>
          ),
        },
        {
          heading: '6. Chargebacks we do not accept',
          body: (
            <p>
              We do not accept requests for a refund because a lesson was not
              what you expected, because the market moved, or because you
              bought the wrong product. Those are covered by the 7-day
              mistake-purchase window in section 1.
            </p>
          ),
        },
        {
          heading: '7. Contact',
          body: (
            <p>
              Any question about a refund goes to{' '}
              <a href={`mailto:${BUSINESS.supportEmail}`} className="text-accent hover:underline">
                {BUSINESS.supportEmail}
              </a>
              . Terms that govern the purchase are on the{' '}
              <a href="/terms" className="text-accent hover:underline">
                Terms &amp; Conditions
              </a>{' '}
              page.
            </p>
          ),
        },
      ]}
    />
  );
}
