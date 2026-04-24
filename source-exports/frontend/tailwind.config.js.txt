/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medigo: {
          blue: {
            DEFAULT: '#2563EB',
            light: '#60A5FA',
            dark: '#1E40AF',
          },
          teal: {
            DEFAULT: '#0EA5E9',
            light: '#7DD3FC',
            dark: '#0369A1',
          },
          navy: {
            DEFAULT: '#0F172A',
            light: '#1E293B',
            dark: '#020617',
          },
          mint: {
            DEFAULT: '#10B981',
            light: '#6EE7B7',
            dark: '#047857',
          }
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(37, 99, 235, 0.15)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
