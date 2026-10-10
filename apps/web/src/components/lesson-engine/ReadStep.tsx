'use client';

import React from 'react';
import { MarkdownText } from '@/components/ui/MarkdownText';

export interface ReadStepProps {
  body: string;
}

export function ReadStep({ body }: ReadStepProps) {
  return <MarkdownText content={body} className="text-base text-ink" />;
}
