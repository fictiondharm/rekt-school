'use client';

import React from 'react';
import { Term } from '@/components/lesson-engine/Term';

export interface MarkdownTextProps {
  content: string;
  className?: string;
}

/**
 * Robust, continuous inline text renderer that:
 * 1. Replaces em-dash characters with clean hyphens.
 * 2. Parses **bold**, *italic*, and `code` tags.
 * 3. Inlines <Term id="xxx">label</Term> seamlessly into sentences without line breaks or space gaps.
 */
export function MarkdownText({ content, className = '' }: MarkdownTextProps) {
  if (!content) return null;

  // Normalize dashes across all content
  const cleanedContent = content.replace(/\u2014/g, ' - ');

  // Split into paragraphs by double newlines
  const paragraphs = cleanedContent.split(/\n\n+/);

  return (
    <div className={`space-y-3.5 ${className}`}>
      {paragraphs.map((paragraph, pIdx) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Check if paragraph is a bullet list
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((line) => line.trim().startsWith('• ') || line.trim().startsWith('- '));

        if (isBulletList) {
          return (
            <ul key={`p-${pIdx}`} className="space-y-1.5 pl-4 list-disc text-ink">
              {lines.map((line, lIdx) => {
                const itemText = line.replace(/^[•\-]\s*/, '');
                return (
                  <li key={`li-${lIdx}`} className="leading-relaxed">
                    {renderInlineFormattedText(itemText)}
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={`p-${pIdx}`} className="leading-relaxed text-ink">
            {renderInlineFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parses inline string into React nodes: Terms, bold, italic, code.
 */
function renderInlineFormattedText(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];

  // Regex to match <Term ...>...</Term>, **bold**, `code`, or *italic*
  const pattern = /(<Term id="[^"]+">[^<]+<\/Term>|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith('<Term')) {
      const termMatch = /<Term id="([^"]+)">([^<]+)<\/Term>/.exec(token);
      if (termMatch) {
        nodes.push(
          <Term key={`term-${match.index}`} id={termMatch[1]}>
            {termMatch[2]}
          </Term>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`b-${match.index}`} className="font-bold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={`c-${match.index}`}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface border border-border text-accent font-semibold mx-0.5"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={`i-${match.index}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  // Push remainder
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
