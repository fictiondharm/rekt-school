'use client';

import React, { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MarkdownText } from '@/components/ui/MarkdownText';

export interface UnderTheHoodProps {
  title?: string;
  body: string;
  className?: string;
  defaultExpanded?: boolean;
}

export function UnderTheHood({
  title = 'Under the Hood: How it Works Internally',
  body,
  className,
  defaultExpanded = false,
}: UnderTheHoodProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl border border-dashed border-accent/40 bg-accent/10 p-4.5 transition-all text-sm',
          className
        )
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Under The Hood (Optional)
            </span>
            <h4 className="font-heading font-bold text-ink text-sm group-hover:text-accent transition-colors">
              {title}
            </h4>
          </div>
        </div>
        <div className="text-ink-soft group-hover:text-accent transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-accent/20 text-ink leading-relaxed space-y-2 text-sm animate-in fade-in duration-200">
          <MarkdownText content={body} className="text-sm" />
        </div>
      )}
    </div>
  );
}
