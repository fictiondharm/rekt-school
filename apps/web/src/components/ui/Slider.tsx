'use client';

import React, { ChangeEvent } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (val: number) => string;
  onChange: (val: number) => void;
  className?: string;
  helperText?: string;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  formatValue,
  onChange,
  className,
  helperText,
  disabled = false,
}: SliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const displayVal = formatValue ? formatValue(value) : `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;

  return (
    <div className={twMerge(clsx('flex flex-col space-y-2', className))}>
      <div className="flex justify-between items-center text-sm font-medium">
        <label className="text-ink font-heading">{label}</label>
        <span className="font-mono text-accent font-bold bg-accent/10 px-2.5 py-0.5 rounded-md">
          {displayVal}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        aria-label={label}
        className="w-full h-2.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50"
      />
      <div className="flex justify-between text-xs text-ink-soft font-mono">
        <span>{formatValue ? formatValue(min) : `${min}${unit}`}</span>
        {helperText && <span className="text-xs text-ink-soft">{helperText}</span>}
        <span>{formatValue ? formatValue(max) : `${max}${unit}`}</span>
      </div>
    </div>
  );
}
