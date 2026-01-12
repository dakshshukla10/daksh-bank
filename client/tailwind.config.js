/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          primary: '#1e3a5f',
          secondary: '#2d5a87',
          accent: '#4a90d9',
          light: '#e8f4fd'
        }
      }
    },
  },
  plugins: [],
}
