'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getGlossaryTerm } from '@/lib/content';
import { BookOpen } from 'lucide-react';

export interface TermProps {
  id: string;
  children?: React.ReactNode;
}

const TIP_WIDTH = 288; // w-72
const GAP = 10;
const EDGE = 12;

type Placement = 'top' | 'bottom';

interface Coords {
  left: number;
  top: number;
  placement: Placement;
  arrow: number;
}

export function Term({ id, children }: TermProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const termData = getGlossaryTerm(id);

  const update = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const centerX = r.left + r.width / 2;

    let left = centerX - TIP_WIDTH / 2;
    left = Math.max(EDGE, Math.min(left, vw - TIP_WIDTH - EDGE));
    const arrow = Math.max(18, Math.min(centerX - left, TIP_WIDTH - 18));

    const placement: Placement = r.top < 170 ? 'bottom' : 'top';
    const top = placement === 'top' ? r.top - GAP : r.bottom + GAP;

    setCoords({ left, top, placement, arrow });
  }, []);

  useEffect(() => {
    if (!open) return;
    update();
    const onMove = () => update();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, update]);

  if (!termData) {
    return <span className="font-semibold text-accent">{children || id}</span>;
  }

  const label = children || termData.term;

  const tooltip =
    coords && (
      <span
        role="tooltip"
        style={{
          left: coords.left,
          top: coords.top,
          width: TIP_WIDTH,
          transform: coords.placement === 'top' ? 'translateY(-100%)' : undefined,
        }}
        className="fixed z-[100] p-3 text-xs font-normal text-white bg-ink rounded-xl shadow-pop pointer-events-none animate-in fade-in select-none"
      >
        <span className="font-bold flex items-center gap-1.5 text-accent/80 mb-1">
          <BookOpen className="w-3.5 h-3.5 inline shrink-0" />
          {termData.term}
        </span>
        <span className="text-white/90 text-[11px] leading-relaxed block">
          {termData.definition}
        </span>
        <span
          style={{ left: coords.arrow }}
          className={`absolute -translate-x-1/2 border-[6px] border-transparent ${
            coords.placement === 'top' ? 'top-full border-t-ink' : 'bottom-full border-b-ink'
          }`}
        />
      </span>
    );

  return (
    <span
      ref={triggerRef}
      className="relative inline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
        className="inline font-semibold text-accent underline decoration-dotted decoration-accent/70 underline-offset-2 hover:text-accent-hover hover:decoration-accent cursor-help transition-colors p-0 m-0 bg-transparent border-0 text-inherit leading-inherit"
      >
        {label}
      </button>

      {open && typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </span>
  );
}
