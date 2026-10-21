import React from 'react';
import Link from 'next/link';
import { BUSINESS, LEGAL_LINKS } from '@/lib/legal';

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-7 text-sm font-medium text-ink-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>
            {BUSINESS.name} · Educational only. Not financial advice.
          </span>
          <div className="flex flex-wrap gap-5">
            <Link href="/glossary" className="hover:text-accent">
              Glossary
            </Link>
            <Link href="/war-stories" className="hover:text-accent">
              War Stories
            </Link>
            <Link href="#pricing" className="hover:text-accent">
              Invite code
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div className="flex flex-wrap gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent">
                {link.label}
              </Link>
            ))}
          </div>
          <a
            href={`mailto:${BUSINESS.supportEmail}`}
            className="hover:text-accent"
          >
            {BUSINESS.supportEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
