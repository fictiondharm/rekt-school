'use client';

import { useEffect, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import { TourStep } from '@defi-mommy/content-schema';

export interface TourWrapperProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
}

export function TourWrapper({ steps, isActive, onComplete }: TourWrapperProps) {
  const driverObj = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    if (!isActive || typeof window === 'undefined' || steps.length === 0) return;

    const driveSteps: DriveStep[] = steps.map((s) => ({
      element: s.target,
      popover: {
        title: s.title,
        description: s.text,
        side: s.side || 'bottom',
        align: 'start',
      },
    }));

    driverObj.current = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(27, 27, 47, 0.75)',
      steps: driveSteps,
      onDestroyStarted: () => {
        if (driverObj.current) {
          driverObj.current.destroy();
          onComplete();
        }
      },
    });

    // Small delay to ensure all DOM elements are mounted
    const timer = setTimeout(() => {
      try {
        driverObj.current?.drive();
      } catch (err) {
        console.warn('Driver.js tour error:', err);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (driverObj.current) {
        try {
          driverObj.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [isActive, steps, onComplete]);

  return null;
}
