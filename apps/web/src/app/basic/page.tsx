'use client';

import React from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Card, Badge, Button, Disclaimer } from '@/components/ui';
import { getAllLessons } from '@/lib/content';
import { GraduationCap, ArrowLeft, ArrowRight, BookOpen, Play, Sparkles } from 'lucide-react';

const lessons = getAllLessons()
  .filter((l) => l.tier === 'basic')
  .sort((a, b) => a.order - b.order);

export default function BasicPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar lessonTitle="Basic" />

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 sm:p-8 space-y-10">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
        </div>

        <section className="text-center space-y-5 py-6">
          <Badge variant="yellow" className="gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> TIER 1 · BASIC
          </Badge>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight leading-tight">
            {lessons.length} hands-on lessons.{' '}
            <span className="text-accent">Start completely free.</span>
          </h1>
          <p className="text-ink-soft max-w-2xl mx-auto leading-relaxed">
            From opening your first wallet to minting a token and making your first swap. Every
            lesson pairs a guided read with a live, zero-risk sandbox so you see exactly what just
            happened and why.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-ink-faint">
            <Sparkles className="w-4 h-4 text-accent" /> No wallet, no real funds ever required
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading font-bold text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> The Basic Curriculum
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((item) => (
              <Link key={item.id} href={`/learn/${item.id.toLowerCase()}`}>
                <Card
                  variant="interactive"
                  className="p-5 space-y-3 border-2 border-ink rounded-xl shadow-pop h-full"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border-2 border-ink bg-bg">
                      {item.id}
                    </span>
                    {item.freePreview && (
                      <Badge variant="accent" className="text-[10px] px-2 py-0.5">
                        FREE
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-base leading-snug min-h-[2.75rem]">
                    {item.title}
                  </h3>
                  <div className="flex items-start gap-1.5 text-xs text-ink-soft">
                    <BookOpen className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span>{item.objectives[0]}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                    Start lesson <ArrowRight className="w-3 h-3" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="text-center space-y-4 pb-8">
          <p className="text-sm text-ink-soft">
            Finish all {lessons.length} and move up to the Intermediate labs.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/learn/b1">
              <Button variant="primary" className="gap-2">
                <Play className="w-4 h-4" /> Start B1: Welcome
              </Button>
            </Link>
            <Link href="/intermediate">
              <Button variant="secondary" className="gap-2">
                See Intermediate
              </Button>
            </Link>
          </div>
        </section>

        <Disclaimer />
      </main>
    </div>
  );
}
