import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { ContactForm } from '@/components/landing/ContactForm';
import { BUSINESS } from '@/lib/legal';

export const metadata = {
  title: 'Contact - Rekt School',
  description: 'Reach the Rekt School support team about payments, access or the course.',
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact Us"
      intro="Payments, access problems, bugs, or feedback — pick whichever is easiest."
      sections={[
        {
          heading: 'Email',
          body: (
            <>
              <p>
                <a
                  href={`mailto:${BUSINESS.supportEmail}`}
                  className="text-accent hover:underline font-semibold"
                >
                  {BUSINESS.supportEmail}
                </a>
                <br />
                We answer within 2 business days, usually the same day.
              </p>
            </>
          ),
        },
        {
          heading: 'Send a message',
          body: (
            <ContactForm supportEmail={BUSINESS.supportEmail} />
          ),
        },
        {
          heading: 'Before you write',
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Payments: include the payment id or the wallet address you paid with.</li>
              <li>Access problems: include the wallet address and a screenshot of the error.</li>
              <li>Refund requests: see the Refunds page for what is refundable.</li>
            </ul>
          ),
        },
        {
          heading: 'Company details',
          body: (
            <>
              <p>
                {BUSINESS.legalName}
                <br />
                {BUSINESS.jurisdiction}
                <br />
                Support:{' '}
                <a
                  href={`mailto:${BUSINESS.supportEmail}`}
                  className="text-accent hover:underline"
                >
                  {BUSINESS.supportEmail}
                </a>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
