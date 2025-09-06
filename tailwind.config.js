/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'helios-dark': '#0d1117', // Añadido para consistencia
        'background-main': 'var(--background-main)',
        'background-panel': 'var(--background-panel)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'helios-accent': 'var(--helios-accent)',
        'border-color': 'var(--border-color)',
      },
      boxShadow: {
        'neo-sm': '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
        'neo': '5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light)',
      }
    },
  },
  plugins: [],
}