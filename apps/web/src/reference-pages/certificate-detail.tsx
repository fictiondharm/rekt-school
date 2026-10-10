'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Card, Button, Badge } from '@/components/ui';
import { Award, Share2, Printer, CheckCircle2, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { getLocalAura } from '@/lib/progress';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CertificatePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const certId = resolvedParams.id;
  const [name, setName] = useState('Solana Explorer');
  const [aura, setAura] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAura(getLocalAura());
    const savedName =
      localStorage.getItem('defi_maxi_display_name') ||
      localStorage.getItem('defi_mommy_display_name') ||
      localStorage.getItem('defi_quest_display_name');
    if (savedName) setName(savedName);
  }, []);

  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar lessonTitle="Certificate of Completion" />

      <main className="max-w-4xl mx-auto w-full p-6 sm:p-8 space-y-8 flex-1">
        <div className="flex justify-between items-center print:hidden">
          <Link
            href="/learn/b1"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Lessons
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-soft bg-surface border-2 border-ink px-2.5 py-1 rounded-lg">
              <span>Name:</span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  localStorage.setItem('defi_maxi_display_name', e.target.value);
                }}
                className="bg-transparent font-bold text-ink outline-none max-w-[140px]"
                placeholder="Your Name"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
              <Share2 className="w-3.5 h-3.5" /> {copied ? 'Link Copied!' : 'Share Certificate'}
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="bg-surface rounded-xl border-2 border-ink p-8 sm:p-14 shadow-pop-lg text-center space-y-8 relative overflow-hidden">

          {/* Header */}
          <div className="space-y-3 relative z-10">
            <div className="w-16 h-16 rounded-full bg-accent text-white mx-auto flex items-center justify-center shadow-pop">
              <Award className="w-8 h-8" />
            </div>
            <span className="font-heading font-bold text-xs uppercase tracking-widest text-accent block">
              Certificate of Completion
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-ink tracking-tight">
              Rekt School: Basic Tier
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto">
              Solana Devnet Interactive Course • Verified Hands-On Blockchain Proficiency
            </p>
          </div>

          {/* Recipient */}
          <div className="space-y-2 relative z-10 py-4 border-y border-border max-w-lg mx-auto">
            <span className="text-xs text-ink-soft uppercase tracking-wider block font-semibold">
              This is proudly presented to
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-bold text-accent">
              {name}
            </h2>
            <p className="text-xs text-ink-soft">
              for successfully mastering decentralized wallets, SPL token accounts,
              token minting, and constant-product AMM swaps on Solana.
            </p>
          </div>

          {/* Details & Signature */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-left relative z-10 max-w-xl mx-auto pt-4 text-xs">
            <div>
              <span className="text-ink-soft block font-semibold">Issue Date</span>
              <span className="font-mono text-ink font-semibold">{issueDate}</span>
            </div>
            <div>
              <span className="text-ink-soft block font-semibold">Certificate ID</span>
              <span className="font-mono text-accent font-semibold">{certId.toUpperCase()}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-ink-soft block font-semibold">Network & Status</span>
              <span className="font-mono text-accent font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Devnet Verified
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-ink-soft relative z-10">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Cryptographically issued by Rekt School • Non-Transferable Educational Credential</span>
          </div>
        </div>
      </main>
    </div>
  );
}
