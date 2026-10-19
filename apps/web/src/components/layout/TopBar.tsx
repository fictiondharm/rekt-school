'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { WalletChip } from '@/components/onchain/WalletChip';
import { Sparkles, Menu, X } from 'lucide-react';
import type { Tier } from '@defi-mommy/content-schema';

interface TopBarProps {
  lessonTitle?: string;
  aura?: number;
  streak?: number;
  showTourButton?: boolean;
  tier?: Tier;
  lessonId?: string;
}

interface NavLink {
  label: string;
  href: string;
  isActive: (path: string) => boolean;
}

const NAV_LINKS: NavLink[] = [
  {
    label: 'Basic',
    href: '/basic',
    isActive: (p) => p === '/basic' || p.startsWith('/basic/') || /^\/learn\/b/i.test(p),
  },
  {
    label: 'Intermediate',
    href: '/intermediate',
    isActive: (p) => p.startsWith('/intermediate') || /^\/learn\/i/i.test(p),
  },
  {
    label: 'Pro',
    href: '/pro',
    isActive: (p) => p === '/pro' || p.startsWith('/pro/') || /^\/learn\/p/i.test(p),
  },
  {
    label: 'War Stories',
    href: '/war-stories',
    isActive: (p) => p.startsWith('/war-stories'),
  },
  {
    label: 'Glossary',
    href: '/glossary',
    isActive: (p) => p.startsWith('/glossary'),
  },
];

export function TopBar({ lessonTitle, aura = 0, showTourButton = false }: TopBarProps) {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Rekt School home"
            className="flex items-center gap-2.5 text-ink hover:opacity-80 transition-opacity shrink-0 min-w-0"
          >
            <Image
              src="/brand/logo-icon.png"
              alt="Rekt School"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-bold text-lg leading-none tracking-tight">Rekt School</span>
              {lessonTitle && (
                <span className="hidden sm:block font-medium text-xs tracking-wider text-ink-faint mt-1 truncate">
                  {lessonTitle}
                </span>
              )}
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = link.isActive(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    active
                      ? 'bg-accent text-white'
                      : 'text-ink hover:bg-accent/10 hover:text-accent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {showTourButton && (
              <button className="bg-tertiary text-ink border-2 border-ink px-4 py-1.5 font-bold text-xs rounded-full hover:shadow-pop-sm transition-all active:translate-x-[1px] active:translate-y-[1px]">
                Tour
              </button>
            )}
            <div
              data-tour="topbar-aura"
              title="Aura: correct answers add Aura, wrong ones subtract it"
              className="hidden sm:flex bg-tertiary text-ink border-2 border-ink px-3 py-1 font-bold text-sm rounded-full items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {aura} Aura
            </div>
            <WalletChip />
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="md:hidden p-2 rounded-lg border-2 border-ink bg-white hover:bg-accent/10 transition-colors shrink-0"
            >
              {menuOpen ? <X className="w-5 h-5 text-ink" /> : <Menu className="w-5 h-5 text-ink" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t-2 border-ink bg-white animate-in fade-in">
          <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = link.isActive(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    active ? 'bg-accent text-white' : 'text-ink hover:bg-accent/10 hover:text-accent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
