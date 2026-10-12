'use client';

import React from 'react';
import Link from 'next/link';
import { getCase } from '@/lib/cases';
import { Card, Badge } from '@/components/ui';
import { Skull, ArrowRight, Clock } from 'lucide-react';

export interface CaseViewProps {
  caseId: string;
}

export function CaseView({ caseId }: CaseViewProps) {
  const c = getCase(caseId);

  if (!c) return null;

  return (
    <Card className="p-5 space-y-4 border-2 border-danger/40 bg-danger/5 rounded-xl">
      <div className="flex items-center gap-2">
        <Skull className="w-5 h-5 text-danger" />
        <span className="font-heading font-bold text-xs uppercase tracking-wider text-danger">
          Real-world case file
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading font-bold text-lg leading-snug text-ink">{c.title}</h3>
        <p className="text-sm text-ink-soft leading-relaxed">{c.tldr}</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant="danger" className="text-[10px] px-2 py-0.5">
          {c.lossUsd.split('(')[0].trim()}
        </Badge>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          {c.category}
        </Badge>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ink-faint">
          <Clock className="w-3 h-3" /> {c.dateLabel}
        </span>
      </div>

      <Link
        href={`/war-stories/${c.id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline"
      >
        Read the full case: wallets, transactions &amp; research method
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Card>
  );
}
