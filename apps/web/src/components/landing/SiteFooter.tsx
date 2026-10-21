import React from 'react';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7 text-sm font-medium text-ink-soft">
        <span>Rekt School · Educational only. Not financial advice.</span>
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
    </footer>
  );
}
