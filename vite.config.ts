import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Helios-AI-Dashboard/', // <--- AÑADIDO: Ruta base para GitHub Pages
  plugins: [react()],
  // Optimiza las dependencias para un arranque más rápido en desarrollo.
  optimizeDeps: {
    include: ['lightweight-charts'],
  },
  // Silencia las advertencias de CSS de bajo nivel que no podemos controlar (de terceros).
  logLevel: 'info',
  // Opciones de compilación
  build: {
    // Genera sourcemaps para CSS para facilitar la depuración en producción.
    sourcemap: true,
  },
  css: {
    // Habilita sourcemaps para CSS en desarrollo para una mejor depuración.
    devSourcemap: true,
  },
})
