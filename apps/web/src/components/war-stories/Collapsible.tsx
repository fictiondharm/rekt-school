'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleProps {
  title: string;
  icon?: React.ReactNode;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Collapsible({
  title,
  icon,
  hint,
  defaultOpen = false,
  children,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-2 border-ink rounded-xl shadow-pop bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/5 transition-colors"
      >
        <span className="flex items-center gap-2 font-heading font-bold text-lg min-w-0">
          {icon}
          <span className="truncate">{title}</span>
        </span>
        {hint && (
          <span className="hidden sm:inline text-[11px] font-mono text-ink-faint ml-auto">
            {hint}
          </span>
        )}
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-accent transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } ${hint ? '' : 'ml-auto'}`}
        />
      </button>
      {open && <div className="px-4 pb-5 pt-1 border-t border-border">{children}</div>}
    </section>
  );
}
