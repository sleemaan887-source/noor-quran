/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F0F6',
          100: '#C9DDEA',
          200: '#93BBCD',
          300: '#5E9AB0',
          400: '#2E7A95',
          500: '#0B3954',
          600: '#0A3149',
          700: '#08293D',
          800: '#061F30',
          900: '#041623',
        },
        secondary: {
          50: '#E6F5F3',
          100: '#C6EAE6',
          200: '#8FD5CD',
          300: '#57BFB4',
          400: '#27A99B',
          500: '#1B998B',
          600: '#178074',
          700: '#13675E',
          800: '#0F4F48',
          900: '#0B3631',
        },
        gold: {
          50: '#FBF6E8',
          100: '#F6ECCF',
          200: '#EFD89E',
          300: '#E8C46D',
          400: '#DDB043',
          500: '#D4AF37',
          600: '#B8962E',
          700: '#947523',
          800: '#70581B',
          900: '#4C3B12',
        },
        sand: {
          50: '#FAF7F0',
          100: '#F3EEE0',
          200: '#E7DCC2',
          300: '#DACBA4',
          400: '#CEBA86',
        },
        night: {
          700: '#0B2530',
          800: '#081F28',
          900: '#071A21',
          950: '#041015',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
        quran: ['Amiri', 'serif'],
        display: ['Reem Kufi', 'Cairo', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(11, 57, 84, 0.08)',
        card: '0 4px 24px -6px rgba(11, 57, 84, 0.12)',
        glow: '0 0 32px -4px rgba(212, 175, 55, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
