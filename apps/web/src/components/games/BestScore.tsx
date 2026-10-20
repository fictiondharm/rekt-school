'use client';

import React, { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/rugTycoon';

/** Reads the local best run after mount so server and client render the same markup first. */
export function BestScore() {
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.best);
      setBest(raw ? parseInt(raw, 10) || 0 : 0);
    } catch {
      /* ignore */
    }
  }, []);

  if (!best) return <>Rug Tycoon</>;
  return (
    <>
      Rug Tycoon <span className="g-best-sep">· best {best.toLocaleString('en-US')}</span>
    </>
  );
}
