/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f8f7f4',
          100: '#f0ede6',
          200: '#e0dbd0',
          300: '#c8c0b0',
          400: '#a89e8a',
          500: '#8a7d6a',
          600: '#6e6355',
          700: '#574e43',
          800: '#3d3730',
          900: '#1a1714',
        }
      }
    },
  },
  plugins: [],
}
