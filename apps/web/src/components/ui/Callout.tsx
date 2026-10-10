import React, { ReactNode } from 'react';
import { Lightbulb, Info, AlertTriangle, Scale } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CalloutProps {
  type?: 'analogy' | 'hint' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({
  type = 'info',
  title,
  children,
  className,
}: CalloutProps) {
  const configs = {
    analogy: {
      icon: Scale,
      bg: 'bg-accent/10',
      border: 'border-accent',
      textColor: 'text-accent',
      iconBg: 'bg-accent',
      defaultTitle: 'Everyday Analogy',
    },
    hint: {
      icon: Lightbulb,
      bg: 'bg-tertiary/20',
      border: 'border-tertiary',
      textColor: 'text-ink',
      iconBg: 'bg-tertiary',
      defaultTitle: 'Helpful Hint',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-red-50',
      border: 'border-red-400',
      textColor: 'text-red-700',
      iconBg: 'bg-red-500',
      defaultTitle: 'Watch Out',
    },
    info: {
      icon: Info,
      bg: 'bg-quaternary/15',
      border: 'border-quaternary',
      textColor: 'text-ink',
      iconBg: 'bg-quaternary',
      defaultTitle: 'Key Concept',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      className={twMerge(
        clsx('rounded-xl border-2 p-4 text-sm', config.bg, config.border, className)
      )}
    >
      <div className="flex items-start gap-3">
        <div className={twMerge(clsx('w-7 h-7 rounded-full border-2 border-ink flex items-center justify-center shrink-0 mt-0.5', config.iconBg))}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="space-y-1 w-full">
          {(title || config.defaultTitle) && (
            <h4 className={twMerge(clsx('font-heading font-bold text-sm', config.textColor))}>
              {title || config.defaultTitle}
            </h4>
          )}
          <div className="text-ink text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
