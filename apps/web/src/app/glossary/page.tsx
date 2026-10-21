'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import glossaryData from '../../../../../content/glossary.json';
import { TopBar } from '@/components/layout/TopBar';
import { Card, Badge, Button } from '@/components/ui';
import { Search, ArrowLeft, BookOpen } from 'lucide-react';
import { GlossaryTerm } from '@defi-mommy/content-schema';

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const terms = glossaryData as GlossaryTerm[];

  const categories = [
    'all',
    'trenches',
    'basics',
    'tokens',
    'defi',
    'yield',
    'lending',
    'staking',
    'tokenomics',
    'dao',
    'pro',
    'safety',
  ];

  const filtered = terms.filter((item) => {
    const matchesQuery =
      item.term.toLowerCase().includes(query.toLowerCase()) ||
      item.definition.toLowerCase().includes(query.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar lessonTitle="Solana DeFi Glossary" />

      <main className="max-w-5xl mx-auto w-full p-6 sm:p-8 space-y-8 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to home
              </Link>
            </div>
            <h1 className="text-3xl font-heading font-bold text-ink flex items-center gap-2.5">
              <BookOpen className="w-8 h-8 text-accent" />
              DeFi Glossary & Terminology
            </h1>
            <p className="text-sm text-ink-soft mt-1">
              Plain English definitions for every concept used in the course. Smart,
              friendly, and zero hype.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 75+ terms..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface rounded-lg border-2 border-ink focus:outline-none focus:ring-2 focus:ring-accent text-ink"
            />
          </div>
        </div>

        {/* Categories pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize border-2 border-ink transition-all duration-300 ease-bounce ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-pop-sm'
                  : 'bg-white text-ink-soft hover:bg-tertiary'
              }`}
            >
              {cat === 'all'
                ? 'All Terms'
                : cat === 'trenches'
                ? 'Crypto Twitter & Trenches'
                : cat}
            </button>
          ))}
        </div>

        {/* Terms list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="p-5 space-y-2 hover:rotate-[-1deg] hover:scale-[1.02] transition-all duration-300 ease-bounce">
              <div className="flex justify-between items-start">
                  <h3 className="font-heading font-bold text-base text-ink">
                    {item.term}
                  </h3>
                {item.category && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {item.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">
                {item.definition}
              </p>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-ink-soft">
            No terms matching "{query}". Try a different search keyword.
          </div>
        )}
      </main>
    </div>
  );
}
