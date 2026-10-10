import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'interactive' | 'bauhaus';
  decorationColor?: 'violet' | 'pink' | 'yellow' | 'mint';
  showDecoration?: boolean;
}

export function Card({
  className,
  variant = 'default',
  decorationColor = 'violet',
  showDecoration = false,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'bg-white border-2 border-ink rounded-xl shadow-pop-lg relative';
  const variants = {
    default: 'shadow-pop-lg',
    flat: 'shadow-none',
    interactive:
      'shadow-pop-lg hover:rotate-[-1deg] hover:scale-[1.02] hover:shadow-pop-pink transition-all duration-300 ease-bounce cursor-pointer',
    bauhaus: 'shadow-pop-lg hover:-translate-y-1 transition-all duration-300 ease-bounce',
  };

  const decorationColors = {
    violet: 'bg-accent',
    pink: 'bg-secondary',
    yellow: 'bg-tertiary',
    mint: 'bg-quaternary',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {showDecoration && (
        <div
          className={clsx(
            'absolute -top-3 -right-3 w-6 h-6 rounded-full border-2 border-ink',
            decorationColors[decorationColor]
          )}
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('flex flex-col space-y-1.5 pb-4', className))} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge(
        clsx('font-heading text-xl font-bold text-ink', className)
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={twMerge(clsx('text-sm leading-relaxed text-ink-soft', className))} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('pt-0', className))} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('flex items-center pt-4', className))} {...props}>
      {children}
    </div>
  );
}
