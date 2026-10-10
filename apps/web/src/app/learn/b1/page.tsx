'use client';

import React, { useState, useEffect } from 'react';
import { getLesson } from '@/lib/content';
import { TopBar } from '@/components/layout/TopBar';
import { CourseSidebar } from '@/components/layout/CourseSidebar';
import { LessonEngine } from '@/components/lesson-engine/LessonEngine';
import { B1PracticeCompanion } from '@/components/lesson-engine/B1PracticeCompanion';
import { getLocalAura } from '@/lib/progress';

export default function LessonB1Page() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aura, setAura] = useState(0);
  const lesson = getLesson('B1');

  useEffect(() => {
    setAura(getLocalAura());
  }, []);

  if (!lesson) {
    return <div className="p-10">Lesson B1 not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <TopBar
        lessonTitle={`${lesson.id}: ${lesson.title}`}
        aura={aura}
        streak={1}
        showTourButton={true}
      />

      <div className="flex-1 flex min-h-0">
        <CourseSidebar
          currentLessonId="B1"
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <LessonEngine
          lesson={lesson}
          practiceSlot={<B1PracticeCompanion />}
          onAuraChange={(delta) => setAura((prev) => prev + delta)}
        />
      </div>
    </div>
  );
}
