'use client';

import React from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { MultiTokenPoolLab } from '@/components/simulators/MultiTokenPoolLab';
import { Button } from '@/components/ui';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function StandaloneMultiTokenPoolLabPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar lessonTitle="Lab: Multi-Token Market Liquidity & Fee Accrual" />
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/labs">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Labs Hub</span>
            </Button>
          </Link>
          <Link href="/learn/i2">
            <Button variant="secondary" size="sm" className="gap-2 text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Explore LP Lesson (I2)</span>
            </Button>
          </Link>
        </div>
        <MultiTokenPoolLab />
      </div>
    </div>
  );
}
