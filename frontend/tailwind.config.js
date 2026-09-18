/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8ee9',
          600: '#0171c7',
          700: '#025aa1',
          800: '#064c84',
          900: '#0b406e',
          950: '#072949',
        },
        banking: {
          navy: '#0f172a',
          gold: '#f59e0b',
          emerald: '#10b981',
          ruby: '#e11d48',
          slate: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'Mangal', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
