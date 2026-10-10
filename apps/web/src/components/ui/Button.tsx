'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  shape?: 'square' | 'pill';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      shape = 'square',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-300 ease-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap active:translate-x-[2px] active:translate-y-[2px]';

    const variants = {
      primary:
        'bg-accent text-white border-2 border-ink shadow-pop hover:shadow-pop-hover hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-pop-sm',
      secondary:
        'bg-transparent text-ink border-2 border-ink rounded-full hover:bg-tertiary',
      yellow:
        'bg-tertiary text-ink border-2 border-ink shadow-pop hover:shadow-pop-hover hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-pop-sm',
      outline:
        'bg-white text-ink border-2 border-ink rounded-full hover:bg-tertiary',
      ghost: 'bg-transparent text-ink border-none hover:bg-muted rounded-full',
      danger:
        'bg-red-500 text-white border-2 border-ink shadow-pop hover:shadow-pop-hover hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-pop-sm',
      accent:
        'bg-accent text-white border-2 border-ink shadow-pop hover:shadow-pop-hover hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-pop-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-full',
      md: 'h-10 px-5 text-sm gap-2 rounded-full',
      lg: 'h-12 px-7 text-base gap-2 rounded-full',
    };

    const shapes = {
      square: '',
      pill: 'rounded-full',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], shapes[shape], className))}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
