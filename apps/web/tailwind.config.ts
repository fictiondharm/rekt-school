import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // Reference breakpoint: the two-column hero / level map layout.
        desktop: '860px',
      },
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          faint: 'var(--ink-faint)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          fg: 'var(--accent-fg)',
          light: '#EDE9FE',
          hover: 'var(--accent-strong)',
          strong: 'var(--accent-strong)',
          tint: 'var(--accent-tint)',
        },
        primary: {
          DEFAULT: 'var(--accent)',
          light: '#EDE9FE',
          hover: 'var(--accent-strong)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          dark: 'var(--secondary-dark)',
          tint: 'var(--secondary-tint)',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary)',
          dark: 'var(--tertiary-dark)',
          tint: 'var(--tertiary-tint)',
        },
        quaternary: {
          DEFAULT: 'var(--quaternary)',
          tint: 'var(--quaternary-tint)',
        },
        line: 'var(--line)',
        warn: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        info: {
          DEFAULT: 'var(--quaternary)',
          light: '#D1FAE5',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          fg: 'var(--muted-fg)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        card: '16px',
        button: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        pop: '4px 4px 0px 0px var(--ink)',
        'pop-sm': '2px 2px 0px 0px var(--ink)',
        'pop-xs': '3px 3px 0px 0px var(--ink)',
        'pop-lg': '8px 8px 0px 0px var(--border)',
        'pop-ink-lg': '8px 8px 0px 0px var(--ink)',
        'pop-accent': '4px 4px 0px 0px var(--accent)',
        'pop-accent-lg': '8px 8px 0px 0px var(--accent)',
        'pop-pink': '8px 8px 0px 0px var(--secondary)',
        'pop-tertiary': '8px 8px 0px 0px var(--tertiary)',
        'pop-mint': '8px 8px 0px 0px var(--quaternary)',
        'pop-hover': '6px 6px 0px 0px var(--ink)',
        'pop-active': '2px 2px 0px 0px var(--ink)',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
};

export default config;
