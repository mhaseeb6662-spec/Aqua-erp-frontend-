/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Aqua Fishing Academy brand token system
        marine: {
          DEFAULT: '#0E2A3F', // deep marine navy - sidebar / dark surfaces
          light: '#173F58',
          dark: '#081A28',
          muted: '#334155',
        },
        tide: {
          DEFAULT: '#0FA3A3', // primary brand / accent teal
          light: '#3FC3C1',
          dark: '#0B7E7E',
        },
        sandbar: {
          DEFAULT: '#E3A857', // secondary accent - gold
          light: '#F0C384',
          dark: '#C4863A',
        },
        mist: '#EFF6F5', // app background
        ink: {
          DEFAULT: '#0F172A', // high-contrast slate-900
          muted: '#475569',   // high-contrast slate-600
        },
        coral: '#E85D4E', // destructive / error accent
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14, 42, 63, 0.06), 0 4px 16px rgba(14, 42, 63, 0.06)',
        pop: '0 8px 30px rgba(14, 42, 63, 0.12)',
      },
      backgroundImage: {
        'ripple-gradient': 'linear-gradient(135deg, #0E2A3F 0%, #0B7E7E 55%, #0FA3A3 100%)',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 0.45 },
          '100%': { transform: 'scale(2.2)', opacity: 0 },
        },
        drift: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-12px)' },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        ripple: 'ripple 900ms ease-out',
        drift: 'drift 6s ease-in-out infinite',
        rise: 'rise 400ms ease-out both',
      },
    },
  },
  plugins: [],
};
