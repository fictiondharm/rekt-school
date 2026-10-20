'use client';

import React from 'react';
import type { Mood } from '@/lib/rugTycoon';

/**
 * Code-drawn pixel characters.
 *
 * Each character is assembled from an array of colored rectangles on a 16x16
 * pixel grid (no image files). Two expressions per character:
 *   - 'buy'  -> happy (open eyes + smile)
 *   - 'walk' -> suspicious (squint + flat mouth + raised brow)
 */

export type CharId = 'rugsy' | 'carl' | 'fiona' | 'harry' | 'wanda' | 'nina' | 'liquidator';

interface Visual {
  skin: string;
  hair: string;
  cloth: string;
  pants: string;
  accent: string;
  hairStyle: 'flat' | 'spiky' | 'long' | 'bald' | 'side';
  accessory: 'shades' | 'glasses' | 'bow' | 'cap' | 'crown' | 'headband';
}

const DARK = '#12111a';
const WHITE = '#efe9dd';

const VISUALS: Record<CharId, Visual> = {
  rugsy: {
    skin: '#c99a63',
    hair: '#2c2117',
    cloth: '#4a3d63',
    pants: '#2a2438',
    accent: '#8a5cf6',
    hairStyle: 'side',
    accessory: 'shades',
  },
  carl: {
    skin: '#e6c09b',
    hair: '#7a7a7a',
    cloth: '#2f5d50',
    pants: '#22392f',
    accent: '#34d399',
    hairStyle: 'flat',
    accessory: 'glasses',
  },
  fiona: {
    skin: '#f0cb9f',
    hair: '#c9772a',
    cloth: '#9c3a63',
    pants: '#5c2340',
    accent: '#f472b6',
    hairStyle: 'long',
    accessory: 'bow',
  },
  harry: {
    skin: '#dcb183',
    hair: '#20293a',
    cloth: '#a4550a',
    pants: '#5c3006',
    accent: '#fbbf24',
    hairStyle: 'spiky',
    accessory: 'cap',
  },
  wanda: {
    skin: '#d3af88',
    hair: '#4a2f1d',
    cloth: '#213b73',
    pants: '#16264a',
    accent: '#5a9bd8',
    hairStyle: 'long',
    accessory: 'crown',
  },
  liquidator: {
    skin: '#e6c09b',
    hair: '#1a1a1a',
    cloth: '#2a2a2a',
    pants: '#1a1a1a',
    accent: '#666666',
    hairStyle: 'flat',
    accessory: 'shades',
  },  nina: {
    skin: '#f2d3b0',
    hair: '#6d28d9',
    cloth: '#5b21b6',
    pants: '#3b1580',
    accent: '#a78bfa',
    hairStyle: 'flat',
    accessory: 'headband',
  },
};

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

function buildRects(v: Visual, mood: Mood): Rect[] {
  const r: Rect[] = [];
  const push = (x: number, y: number, w: number, h: number, fill: string) =>
    r.push({ x, y, w, h, fill });

  // Hair back layer (for long styles)
  if (v.hairStyle === 'long') {
    push(3, 3, 1, 7, v.hair);
    push(12, 3, 1, 7, v.hair);
  }

  // Head + hair
  push(4, 3, 8, 6, v.skin);
  push(4, 2, 8, 2, v.hair);
  if (v.hairStyle === 'spiky') {
    push(4, 1, 2, 1, v.hair);
    push(7, 1, 2, 1, v.hair);
    push(10, 1, 2, 1, v.hair);
  } else if (v.hairStyle === 'side') {
    push(3, 4, 1, 2, v.hair);
    push(4, 2, 5, 1, v.hair);
  } else if (v.hairStyle === 'flat') {
    push(4, 2, 8, 2, v.hair);
  }

  // Neck + body
  push(7, 9, 2, 1, v.skin);
  push(5, 9, 6, 5, v.cloth);
  push(3, 9, 1, 4, v.cloth);
  push(12, 9, 1, 4, v.cloth);
  push(3, 13, 1, 1, v.skin);
  push(12, 13, 1, 1, v.skin);

  // Legs + shoes
  push(5, 14, 2, 2, v.pants);
  push(9, 14, 2, 2, v.pants);
  push(5, 15, 2, 1, DARK);
  push(9, 15, 2, 1, DARK);

  // Eyes
  if (mood === 'buy') {
    push(5, 5, 2, 1, WHITE);
    push(9, 5, 2, 1, WHITE);
    push(6, 5, 1, 1, DARK);
    push(10, 5, 1, 1, DARK);
    // smile
    push(5, 7, 1, 1, DARK);
    push(10, 7, 1, 1, DARK);
    push(6, 8, 4, 1, DARK);
  } else {
    // squint + raised brow
    push(5, 4, 2, 1, DARK);
    push(9, 4, 1, 1, DARK);
    push(5, 5, 2, 1, DARK);
    push(9, 5, 2, 1, DARK);
    push(6, 7, 4, 1, DARK);
  }

  // Accessory (drawn last so it sits on top)
  switch (v.accessory) {
    case 'shades':
      push(4, 4, 8, 2, DARK);
      push(3, 5, 1, 1, DARK);
      push(12, 5, 1, 1, DARK);
      break;
    case 'glasses':
      push(4, 5, 3, 2, v.accent);
      push(5, 6, 1, 1, DARK);
      push(9, 5, 3, 2, v.accent);
      push(10, 6, 1, 1, DARK);
      push(7, 6, 2, 1, v.accent);
      push(3, 6, 1, 1, v.accent);
      push(12, 6, 1, 1, v.accent);
      break;
    case 'bow':
      push(4, 1, 3, 2, v.accent);
      push(9, 1, 3, 2, v.accent);
      push(7, 1, 2, 2, v.cloth);
      break;
    case 'cap':
      push(3, 2, 10, 2, v.accent);
      push(3, 4, 6, 1, v.cloth);
      break;
    case 'crown':
      push(5, 1, 6, 2, v.accent);
      push(5, 0, 1, 1, v.accent);
      push(7, 0, 1, 1, v.accent);
      push(10, 0, 1, 1, v.accent);
      break;
    case 'headband':
      push(4, 3, 8, 1, v.accent);
      break;
  }

  return r;
}

interface CharacterProps {
  id: CharId;
  mood: Mood;
  size?: number;
  dim?: boolean;
  className?: string;
  title?: string;
}

export function Character({ id, mood, size = 64, dim = false, className, title }: CharacterProps) {
  const visual = VISUALS[id];
  const rects = buildRects(visual, mood);

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={title || id}
      style={{
        imageRendering: 'pixelated',
        opacity: dim ? 0.4 : 1,
        filter: dim ? 'grayscale(0.7)' : undefined,
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      {title ? <title>{title}</title> : null}
      {rects.map((rect, i) => (
        <rect
          key={i}
          x={rect.x}
          y={rect.y}
          width={rect.w}
          height={rect.h}
          fill={rect.fill}
        />
      ))}
    </svg>
  );
}

export const CHARACTER_IDS: CharId[] = ['rugsy', 'carl', 'fiona', 'harry', 'wanda', 'nina', 'liquidator'];
