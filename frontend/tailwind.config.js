/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f4ff',
          100: '#dbe4ff',
          400: '#4a7fd4',
          500: '#2563eb',
          600: '#1a4fba',
          700: '#1a3c6e',
          800: '#122a50',
          900: '#0d1e3a',
        },
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body:    ['Nunito Sans', 'sans-serif'],
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease both',
        'fade-in':    'fadeIn 0.3s ease both',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'teal': '0 6px 20px rgba(13,148,136,.25)',
        'navy': '0 6px 20px rgba(26,60,110,.2)',
        'card': '0 4px 16px rgba(0,0,0,.07)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
