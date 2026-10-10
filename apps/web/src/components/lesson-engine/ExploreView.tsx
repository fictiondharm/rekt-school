'use client';

import React from 'react';
import { getExploreCard } from '@/lib/content';
import { Card, CardTitle, CardDescription, Badge } from '@/components/ui';
import { ExternalLink, ShieldAlert } from 'lucide-react';

export interface ExploreViewProps {
  cardIds: string[];
}

export function ExploreView({ cardIds }: ExploreViewProps) {
  const cards = cardIds.map((id) => getExploreCard(id)).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-3">
        <h3 className="font-heading font-bold text-base text-ink">
          Explore the Real Thing
        </h3>
        <p className="text-xs text-ink-soft">
          Real Solana projects you can explore now that you understand the concepts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cards.map((card) => {
          if (!card) return null;
          return (
            <Card key={card.id} className="p-4 space-y-3 hover:border-accent/40 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="primary" className="mb-1 text-[10px] px-2 py-0.5">
                    {card.category}
                  </Badge>
                  <CardTitle className="text-base">{card.name}</CardTitle>
                </div>
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover bg-accent/10 px-2.5 py-1 rounded-md"
                >
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <CardDescription className="text-ink text-xs">
                {card.whatItDoes}
              </CardDescription>

              <div className="flex items-start gap-2 bg-tertiary/30 border border-tertiary p-2.5 rounded-lg text-[11px] text-amber-900 leading-normal">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Watch out: </span>
                  {card.watchOutFor}
                </div>
              </div>

              <div className="text-[10px] text-ink-soft/70 text-right">
                Verified: {card.lastVerified}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
