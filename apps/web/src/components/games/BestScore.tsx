'use client';

import React, { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/rugTycoon';

/** Reads the local best run after mount so server and client render the same markup first. */
export function BestScore({
  storageKey = STORAGE_KEYS.best,
  label = 'Rug Tycoon',
}: {
  storageKey?: string;
  label?: string;
} = {}) {
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setBest(raw ? parseInt(raw, 10) || 0 : 0);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  if (!best) return <>{label}</>;
  return (
    <>
      {label} <span className="g-best-sep">· best {best.toLocaleString('en-US')}</span>
    </>
  );
}
