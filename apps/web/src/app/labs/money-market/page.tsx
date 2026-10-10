'use client';

import React from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { MoneyMarketLab } from '@/components/simulators/MoneyMarketLab';
import { Button } from '@/components/ui';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function StandaloneMoneyMarketLabPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar lessonTitle="Lab: Money Market & Kinked Curve" />
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/labs">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Labs Hub</span>
            </Button>
          </Link>
          <Link href="/learn/i6">
            <Button variant="secondary" size="sm" className="gap-2 text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Open in Lesson I6</span>
            </Button>
          </Link>
        </div>
        <MoneyMarketLab />
      </div>
    </div>
  );
}
