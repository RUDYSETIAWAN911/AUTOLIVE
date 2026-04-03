/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        secondary: '#00B4D8',
        dark: { DEFAULT: '#0A0A0A', card: '#111111' },
        light: { DEFAULT: '#F5F5F5', card: '#FFFFFF' }
      }
    }
  },
  plugins: []
}
