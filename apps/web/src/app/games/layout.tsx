import React from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { PixelBackdrop } from '@/components/games/PixelBackdrop';
import './games.css';

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap"
        precedence="games-pixelify"
      />
      <div className="g-root">
        <PixelBackdrop />
        <TopBar lessonTitle="Games" />
        {children}
      </div>
    </>
  );
}
