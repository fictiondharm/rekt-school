'use client';

import React, { useState, useEffect } from 'react';
import { getLesson } from '@/lib/content';
import { TopBar } from '@/components/layout/TopBar';
import { CourseSidebar } from '@/components/layout/CourseSidebar';
import { LessonEngine } from '@/components/lesson-engine/LessonEngine';
import { LiquidityLab } from '@/components/simulators/LiquidityLab';
import { getLocalAura } from '@/lib/progress';

export default function LessonI1Page() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aura, setAura] = useState(0);
  const lesson = getLesson('I1');

  useEffect(() => {
    setAura(getLocalAura());
  }, []);

  if (!lesson) {
    return <div className="p-10">Lesson I1 not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <TopBar
        lessonTitle={`${lesson.id}: ${lesson.title}`}
        aura={aura}
        streak={1}
      />

      <div className="flex-1 flex min-h-0">
        <CourseSidebar
          currentLessonId="I1"
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <LessonEngine
          lesson={lesson}
          practiceSlot={<LiquidityLab />}
          onAuraChange={(delta) => setAura((prev) => prev + delta)}
        />
      </div>
    </div>
  );
}
