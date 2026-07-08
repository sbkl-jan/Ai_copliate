/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f3ff',
          100: '#e1e7ff',
          200: '#c8d3ff',
          300: '#a1b4ff',
          400: '#738eff',
          500: '#4660ff', // main accent blue-indigo
          600: '#2b3eff',
          700: '#1b28f0',
          800: '#1720c2',
          900: '#19209a',
        },
        dark: {
          50: '#a3a3a3',
          100: '#737373',
          200: '#525252',
          300: '#404040',
          400: '#262626',
          500: '#171717',
          600: '#0d0d0d', // dark backdrop background
          700: '#050505',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          bg: 'rgba(15, 15, 20, 0.65)',
          highlight: 'rgba(255, 255, 255, 0.03)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.3, filter: 'blur(8px)' },
          '50%': { opacity: 0.8, filter: 'blur(16px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
