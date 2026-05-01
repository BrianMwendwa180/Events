/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fox: {
          red: '#C8102E',
          gold: '#B8860B',
          dark: '#1A1A1A',
          charcoal: '#2D2D2D',
          light: '#F5F0E8',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
