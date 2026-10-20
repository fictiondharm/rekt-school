'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Chunky pixel-grid background: the Solana mark (three slanted bars) drawn from
 * big square pixels on near-black, muted purple/teal at ~12% opacity, drifting
 * very slowly.
 *
 * Performance guards:
 *  - capped device pixel ratio
 *  - ~11fps throttle
 *  - pauses when the tab is hidden
 *  - static single frame when prefers-reduced-motion is set
 */

const LOGO_W = 64;
const LOGO_H = 40;
const PURPLE = 'rgba(138, 92, 246, 0.13)';
const TEAL = 'rgba(45, 212, 191, 0.11)';
const BG = '#0b0b0f';

function buildLogo(): Uint8Array {
  const grid = new Uint8Array(LOGO_W * LOGO_H);
  const barH = 3;
  const gap = 2;
  const totalH = barH * 3 + gap * 2; // 13
  const top = Math.floor((LOGO_H - totalH) / 2);
  const len = Math.floor(LOGO_W * 0.66);
  const left0 = Math.floor((LOGO_W - len) / 2) - 5;
  const slope = 1.5;

  for (let bar = 0; bar < 3; bar++) {
    const r0 = top + bar * (barH + gap);
    for (let r = r0; r < r0 + barH; r++) {
      const shift = Math.round(-(r - r0) * slope);
      const offset = bar === 1 ? 4 : 0;
      const lx = left0 + shift + offset;
      for (let x = lx; x < lx + len; x++) {
        if (r >= 0 && r < LOGO_H && x >= 0 && x < LOGO_W) {
          grid[r * LOGO_W + x] = bar === 1 ? 2 : 1;
        }
      }
    }
  }
  return grid;
}

export function PixelBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const logo = buildLogo();
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let last = 0;
    let running = true;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5);

    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
    };

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      // Scale so the mark fills a comfortable chunk of any viewport.
      const scale = Math.max(w / (LOGO_W * 1.5), h / (LOGO_H * 1.5));
      const gw = LOGO_W * scale;
      const gh = LOGO_H * scale;
      const driftX = reduceMotion ? 0 : Math.sin(t / 45000) * scale * 1.6;
      const driftY = reduceMotion ? 0 : Math.cos(t / 61000) * scale * 1.2;
      const ox = (w - gw) / 2 + driftX;
      const oy = (h - gh) / 2 + driftY;
      const cell = scale + 0.6;

      for (let y = 0; y < LOGO_H; y++) {
        for (let x = 0; x < LOGO_W; x++) {
          const c = logo[y * LOGO_W + x];
          if (!c) continue;
          ctx.fillStyle = c === 2 ? TEAL : PURPLE;
          ctx.fillRect(ox + x * scale, oy + y * scale, cell, cell);
        }
      }
    };

    const frame = (ts: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (ts - last < 90) return; // ~11fps
      last = ts;
      draw(ts);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    if (reduceMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="g-backdrop" aria-hidden="true" />;
}
