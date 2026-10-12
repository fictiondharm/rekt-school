'use client';

import React from 'react';
import { CaseFlow, CaseFlowNode, CaseFlowEdge } from '@defi-mommy/content-schema';
import { GitBranch } from 'lucide-react';

const COL_W = 300;
const ROW_H = 178;
const NODE_W = 244;
const NODE_H = 118;
const PAD = 24;

const KIND_STYLE: Record<
  CaseFlowNode['kind'],
  { fill: string; stroke: string; text: string; badge: string }
> = {
  attacker: { fill: '#fef2f2', stroke: '#ef4444', text: '#991b1b', badge: '#ef4444' },
  funding: { fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e', badge: '#f59e0b' },
  wallet: { fill: '#fff7ed', stroke: '#f97316', text: '#9a3412', badge: '#f97316' },
  account: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e3a8a', badge: '#3b82f6' },
  venue: { fill: '#f5f3ff', stroke: '#8b5cf6', text: '#5b21b6', badge: '#8b5cf6' },
  oracle: { fill: '#fefce8', stroke: '#eab308', text: '#854d0e', badge: '#eab308' },
  protocol: { fill: '#f0fdfa', stroke: '#14b8a6', text: '#115e59', badge: '#14b8a6' },
  asset: { fill: '#ecfdf5', stroke: '#10b981', text: '#065f46', badge: '#10b981' },
  exit: { fill: '#f0fdf4', stroke: '#22c55e', text: '#14532d', badge: '#22c55e' },
  outcome: { fill: '#f8fafc', stroke: '#64748b', text: '#334155', badge: '#64748b' },
};

const EDGE_COLOR: Record<CaseFlowEdge['kind'], string> = {
  fund: '#f59e0b',
  trade: '#3b82f6',
  price: '#ef4444',
  exploit: '#ef4444',
  extract: '#22c55e',
  outcome: '#64748b',
};

function box(n: CaseFlowNode) {
  return {
    x: PAD + n.col * COL_W,
    y: PAD + n.row * ROW_H,
    w: NODE_W,
    h: NODE_H,
  };
}

function edgeGeometry(a: CaseFlowNode, b: CaseFlowNode) {
  const s = box(a);
  const t = box(b);
  const sc = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
  const tc = { x: t.x + t.w / 2, y: t.y + t.h / 2 };
  let p1, p2, c1, c2;
  if (Math.abs(tc.x - sc.x) >= Math.abs(tc.y - sc.y)) {
    if (tc.x > sc.x) {
      p1 = { x: s.x + s.w, y: sc.y };
      p2 = { x: t.x, y: tc.y };
    } else {
      p1 = { x: s.x, y: sc.y };
      p2 = { x: t.x + t.w, y: tc.y };
    }
    const mx = (p1.x + p2.x) / 2;
    c1 = { x: mx, y: p1.y };
    c2 = { x: mx, y: p2.y };
  } else {
    if (tc.y > sc.y) {
      p1 = { x: sc.x, y: s.y + s.h };
      p2 = { x: tc.x, y: t.y };
    } else {
      p1 = { x: sc.x, y: s.y };
      p2 = { x: tc.x, y: t.y + t.h };
    }
    const my = (p1.y + p2.y) / 2;
    c1 = { x: p1.x, y: my };
    c2 = { x: p2.x, y: my };
  }
  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  return {
    d: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`,
    mid,
  };
}

function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,1}$/, '…');
  }
  return lines;
}

export function FlowDiagram({ flow }: { flow: CaseFlow }) {
  const byId = new Map(flow.nodes.map((n) => [n.id, n]));
  const maxCol = Math.max(...flow.nodes.map((n) => n.col));
  const maxRow = Math.max(...flow.nodes.map((n) => n.row));
  const width = PAD * 2 + maxCol * COL_W + NODE_W;
  const height = PAD * 2 + maxRow * ROW_H + NODE_H;

  const edgeColors = Array.from(new Set(flow.edges.map((e) => e.kind)));

  return (
    <div className="space-y-3">
      {flow.caption && (
        <p className="text-xs text-ink-soft leading-relaxed flex items-start gap-2">
          <GitBranch className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          {flow.caption}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border-2 border-ink bg-surface shadow-pop">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: Math.max(width, 640), height }}
          className="block"
          role="img"
          aria-label="Attack flow diagram"
        >
          <defs>
            {edgeColors.map((k) => (
              <marker
                key={k}
                id={`arrow-${k}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_COLOR[k]} />
              </marker>
            ))}
          </defs>

          {flow.edges.map((e, i) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const { d, mid } = edgeGeometry(a, b);
            const color = EDGE_COLOR[e.kind];
            const label = e.label ? wrap(e.label, 26, 2) : [];
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={e.kind === 'price' || e.kind === 'exploit' ? 2.4 : 2}
                  strokeDasharray={e.kind === 'price' ? '6 5' : undefined}
                  markerEnd={`url(#arrow-${e.kind})`}
                  opacity={0.9}
                />
                {label.length > 0 && (
                  <g>
                    <rect
                      x={mid.x - 72}
                      y={mid.y - 9 - (label.length - 1) * 7}
                      width={144}
                      height={14 * label.length + 6}
                      rx={5}
                      fill="#ffffff"
                      stroke={color}
                      strokeWidth={0.8}
                      opacity={0.96}
                    />
                    {label.map((ln, li) => (
                      <text
                        key={li}
                        x={mid.x}
                        y={mid.y - (label.length - 1) * 7 + li * 14 + 3}
                        textAnchor="middle"
                        fontSize={10.5}
                        fontFamily="ui-monospace, monospace"
                        fontWeight={600}
                        fill={color}
                      >
                        {ln}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            );
          })}

          {flow.nodes.map((n) => {
            const bx = box(n);
            const style = KIND_STYLE[n.kind];
            const titleLines = wrap(n.label, 24, 2);
            const detailLines = n.detail ? wrap(n.detail, 34, 2) : [];
            return (
              <g key={n.id}>
                <rect
                  x={bx.x}
                  y={bx.y}
                  width={bx.w}
                  height={bx.h}
                  rx={12}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={2}
                />
                <rect x={bx.x} y={bx.y} width={6} height={bx.h} rx={3} fill={style.badge} />
                {titleLines.map((ln, li) => (
                  <text
                    key={li}
                    x={bx.x + 16}
                    y={bx.y + 24 + li * 16}
                    fontSize={13}
                    fontFamily="ui-sans-serif, system-ui"
                    fontWeight={700}
                    fill={style.text}
                  >
                    {ln}
                  </text>
                ))}
                {detailLines.map((ln, li) => (
                  <text
                    key={li}
                    x={bx.x + 16}
                    y={bx.y + 24 + titleLines.length * 16 + 4 + li * 13}
                    fontSize={10.5}
                    fontFamily="ui-sans-serif, system-ui"
                    fill={style.text}
                    opacity={0.78}
                  >
                    {ln}
                  </text>
                ))}
                {n.address && (
                  <a href={n.explorerUrl ?? '#'} target="_blank" rel="noreferrer">
                    <text
                      x={bx.x + 16}
                      y={bx.y + bx.h - 12}
                      fontSize={9}
                      fontFamily="ui-monospace, monospace"
                      fontWeight={600}
                      fill={style.badge}
                      textDecoration={n.explorerUrl ? 'underline' : undefined}
                    >
                      {n.address.length > 34 ? n.address.slice(0, 16) + '…' + n.address.slice(-12) : n.address}
                    </text>
                  </a>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {flow.edges.map((e, i) => {
          const seen = flow.edges.slice(0, i).some((x) => x.kind === e.kind);
          if (seen) return null;
          return (
            <span key={e.kind} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ink-soft">
              <span
                className="inline-block w-4 h-0.5"
                style={{ backgroundColor: EDGE_COLOR[e.kind] }}
              />
              {e.kind}
            </span>
          );
        })}
      </div>
    </div>
  );
}
