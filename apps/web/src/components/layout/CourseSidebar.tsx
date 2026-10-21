'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { CheckCircle2, Lock, Play, ChevronLeft, ChevronRight, BookOpen, Skull } from 'lucide-react';
import { isAccessGateEnabled } from '@/lib/access';
import { hasUnlockedCourse } from '@/lib/unlock';

export interface CourseSidebarProps {
  currentLessonId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Rendered inside a full-screen mobile drawer instead of the desktop rail. */
  inOverlay?: boolean;
}

export function CourseSidebar({
  currentLessonId = 'B1',
  isCollapsed,
  onToggleCollapse,
  inOverlay = false,
}: CourseSidebarProps) {
  const [hasUnlockedAll, setHasUnlockedAll] = React.useState(false);
  const [gateEnabled, setGateEnabled] = React.useState(true);

  React.useEffect(() => {
    const checkUnlock = () => {
      if (typeof window !== 'undefined') {
        setGateEnabled(isAccessGateEnabled());
        setHasUnlockedAll(hasUnlockedCourse());
      }
    };
    checkUnlock();
    window.addEventListener('storage', checkUnlock);
    return () => window.removeEventListener('storage', checkUnlock);
  }, []);

  const unlocked = hasUnlockedAll || !gateEnabled;

  const basicLessons = [
    { id: 'B1', title: 'Welcome & UI Tour', free: true, active: true },
    { id: 'B2', title: 'Your Wallet', free: false },
    { id: 'B3', title: 'Wallet Security', free: false },
    { id: 'B4', title: 'Gas and Fees', free: false },
    { id: 'B5', title: 'Tokens & Accounts', free: false },
    { id: 'B6', title: 'Mint Your Token', free: false },
    { id: 'B7', title: 'Your First Swap', free: false },
    { id: 'B8', title: 'Market Cap & FDV', free: false },
    { id: 'B9', title: 'Meet TVL', free: false },
    { id: 'B10', title: 'Scam Awareness 101', free: false },
  ];

  const proLessons = [
    { id: 'P1', title: 'Order Types (Market/Limit/Stop)', free: false },
    { id: 'P2', title: 'Order Books vs AMMs', free: false },
    { id: 'P3', title: 'Leverage & Perpetuals', free: false },
    { id: 'P4', title: 'Funding Rates & Mark Price', free: false },
    { id: 'P5', title: 'Oracles & Flash Loans', free: true },
    { id: 'P6', title: 'MEV & Sandwiches', free: false },
    { id: 'P7', title: 'Concentrated Liquidity', free: false },
    { id: 'P8', title: 'Cross-Chain Bridges', free: false },
    { id: 'P9', title: 'Memecoins & Bonding Curves', free: false },
    { id: 'P10', title: 'Smart Contract Auditing', free: false },
    { id: 'P11', title: 'Risk & Drawdown Math', free: false },
    { id: 'P12', title: 'Capstone: Protocol Architect', free: false },
  ];

  const intermediateLessons = [
    { id: 'I1', title: 'Liquidity Lab (AMM)', free: true, active: true },
    { id: 'I2', title: 'Be the Liquidity Provider', free: false },
    { id: 'I3', title: 'Yield Lab (APR/APY)', free: false },
    { id: 'I4', title: 'Impermanent Loss Lab', free: false },
    { id: 'I5', title: 'Stablecoins & Depegs', free: false },
    { id: 'I6', title: 'Money Market Lab (Lending)', free: false },
    { id: 'I7', title: 'Liquidation & Health Factor', free: false },
    { id: 'I8', title: 'Staking & Liquid Staking (LST)', free: false },
    { id: 'I9', title: 'Tokenomics 1: Supply & Vesting', free: false },
    { id: 'I10', title: 'Token Cliffs & Unlock Pressure', free: false },
    { id: 'I11', title: 'Estimating a Launch', free: false },
    { id: 'I12', title: 'Historical Exploits & Lessons', free: false },
    { id: 'I13', title: 'Read the Chain Yourself', free: false },
    { id: 'I14', title: 'Governance, DAOs & Airdrops', free: false },
  ];

  if (isCollapsed) {
    return (
      <aside className="w-14 border-r border-border bg-surface flex flex-col items-center py-4 justify-between transition-all">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-accent/10 text-ink-soft hover:text-accent rounded-lg"
          title="Expand Course Map"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      data-tour="course-map"
      className={`border-r border-border bg-surface flex flex-col overflow-y-auto select-none transition-all ${
        inOverlay ? 'w-full h-full' : 'w-72 h-[calc(100vh-4rem)] sticky top-16'
      }`}
    >
      <div className="p-4 border-b border-border flex justify-between items-center gap-2">
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-sm text-ink flex items-center gap-1.5">
            Rekt School Curriculum
          </h3>
          <p className="text-xs text-ink-soft">Basic · Intermediate · Pro</p>
        </div>
        {!inOverlay && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-accent/10 text-ink-soft hover:text-accent rounded-lg transition-colors shrink-0"
            title="Collapse Course Map"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Basic Tier */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-heading font-semibold text-xs uppercase tracking-wider text-accent">
              Basic Tier (Solana Devnet)
            </span>
          </div>

          <div className="space-y-1">
            {basicLessons.map((item) => {
              const isSelected = item.id === currentLessonId;
              return (
                <Link
                  key={item.id}
                  href={`/learn/${item.id.toLowerCase()}`}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all duration-300 ease-bounce ${
                    isSelected
                      ? 'bg-accent/10 text-accent font-bold border-2 border-ink shadow-pop-sm'
                      : 'hover:bg-accent/10 text-ink border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isSelected ? (
                      <Play className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />
                    ) : item.id === 'B1' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                    ) : unlocked ? (
                      <Play className="w-3.5 h-3.5 text-accent shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-ink-soft/60 shrink-0" />
                    )}
                    <span className="truncate">
                      {item.id}: {item.title}
                    </span>
                  </div>
                  {item.free && (
                    <Badge variant="accent" className="text-[10px] px-1.5 py-0 shrink-0">
                      Free
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Intermediate Tier */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-heading font-semibold text-xs uppercase tracking-wider text-ink-soft">
              Intermediate Tier (Sandbox)
            </span>
          </div>

          <div className="space-y-1">
            {intermediateLessons.map((item) => {
              const isSelected = item.id === currentLessonId;
              return (
                <Link
                  key={item.id}
                  href={`/learn/${item.id.toLowerCase()}`}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all duration-300 ease-bounce ${
                    isSelected
                      ? 'bg-accent/10 text-accent font-bold border-2 border-ink shadow-pop-sm'
                      : 'hover:bg-accent/10 text-ink border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.free || unlocked ? (
                      <Play className="w-3.5 h-3.5 text-accent shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-ink-soft/60 shrink-0" />
                    )}
                    <span className="truncate">
                      {item.id}: {item.title}
                    </span>
                  </div>
                  {item.free && (
                    <Badge variant="accent" className="text-[10px] px-1.5 py-0 shrink-0">
                      Free Lab
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pro Tier */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-heading font-semibold text-xs uppercase tracking-wider text-ink-soft">
              Pro Tier (Sandbox)
            </span>
          </div>

          <div className="space-y-1">
            {proLessons.map((item) => {
              const isSelected = item.id === currentLessonId;
              return (
                <Link
                  key={item.id}
                  href={`/learn/${item.id.toLowerCase()}`}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all duration-300 ease-bounce ${
                    isSelected
                      ? 'bg-accent/10 text-accent font-bold border-2 border-ink shadow-pop-sm'
                      : 'hover:bg-accent/10 text-ink border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.free || unlocked ? (
                      <Play className="w-3.5 h-3.5 text-accent shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-ink-soft/60 shrink-0" />
                    )}
                    <span className="truncate">
                      {item.id}: {item.title}
                    </span>
                  </div>
                  {item.free && (
                    <Badge variant="accent" className="text-[10px] px-1.5 py-0 shrink-0">
                      Free Preview
                    </Badge>
                  )}
                  {item.id === 'P12' && (
                    <Badge variant="yellow" className="text-[10px] px-1.5 py-0 shrink-0">
                      Finals
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/glossary"
          className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-ink-soft hover:text-accent hover:bg-accent/10 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-accent" />
          <span>Full Solana DeFi Glossary</span>
        </Link>
        <Link
          href="/war-stories"
          className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-ink-soft hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <Skull className="w-4 h-4 text-danger" />
          <span>War Stories: Real Exploits</span>
        </Link>
      </div>
    </aside>
  );
}
