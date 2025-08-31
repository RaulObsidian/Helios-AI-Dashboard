/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'helios-dark': '#111827',    // Un gris muy oscuro para el fondo principal
        'helios-gray': '#1F2937',    // Un gris oscuro para el fondo de las tarjetas
        'helios-accent': '#38BDF8',  // Un azul cielo vibrante para acentos
        'helios-green': '#34D399',   // Un verde esmeralda para indicadores positivos
        'helios-red': '#F87171',      // Un rojo claro para indicadores negativos
      },
    },
  },
  plugins: [],
}
