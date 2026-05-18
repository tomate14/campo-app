import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary:     { DEFAULT: 'var(--primary)',     foreground: 'var(--primary-foreground)' },
        secondary:   { DEFAULT: 'var(--secondary)',   foreground: 'var(--secondary-foreground)' },
        accent:      { DEFAULT: 'var(--accent)' },
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        muted:       { DEFAULT: 'var(--muted)',       foreground: 'var(--muted-foreground)' },
        border:      'var(--border)',
        destructive: { DEFAULT: 'var(--destructive)' },
        ring:        'var(--ring)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'DM Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}

export default config
