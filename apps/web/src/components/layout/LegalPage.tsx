import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BUSINESS, LEGAL_LINKS } from '@/lib/legal';

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

export interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Shared layout for the legal pages (terms, privacy, refunds, contact) so they
 * all look and behave the same, and so the footer links stay in sync.
 */
export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar />

      <main className="max-w-3xl mx-auto w-full p-6 sm:p-8 space-y-8 flex-1">
        <div className="border-b border-border pb-6">
          <Link
            href="/"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <h1 className="text-3xl font-heading font-bold text-ink">{title}</h1>
          <p className="text-sm text-ink-soft mt-2">{intro}</p>
          <p className="text-xs text-ink-faint mt-3">
            Last updated: {BUSINESS.updatedAt}
          </p>
        </div>

        <div className="space-y-7">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="font-heading font-bold text-lg text-ink">
                {section.heading}
              </h2>
              <div className="text-sm leading-relaxed text-ink-soft space-y-3">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <nav className="border-t border-border pt-6 flex flex-wrap gap-5 text-sm font-medium">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-accent hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
