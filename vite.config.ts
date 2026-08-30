import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://santosemiliano.github.io/Kindi-Lab/ on GitHub Pages.
  base: '/Kindi-Lab/',
  plugins: [react(), tailwindcss()],
})
