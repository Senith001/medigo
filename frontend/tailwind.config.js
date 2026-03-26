/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#1a3c6e', dark: '#122a50', light: '#2a5298' },
        teal:  { DEFAULT: '#0d9488', light: '#14b8a6', lighter: '#ccfbf1' },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body:    ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
