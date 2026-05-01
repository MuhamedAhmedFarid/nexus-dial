/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22c55e',
          foreground: '#0a1628',
        },
        background: '#0a1628',
        card: '#0f2040',
        secondary: '#162952',
        border: 'rgba(255,255,255,0.1)',
        input: 'rgba(255,255,255,0.1)',
        foreground: '#ffffff',
        'muted-foreground': '#94a3b8',
        accent: {
          DEFAULT: '#dcfce7',
          foreground: '#14532d',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        ring: '#22c55e',
        muted: {
          DEFAULT: '#162952',
          foreground: '#94a3b8',
        },
        popover: {
          DEFAULT: '#0f2040',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.6rem',
        sm: '0.4rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
