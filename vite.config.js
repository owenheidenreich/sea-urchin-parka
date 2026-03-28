import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sea-urchin-parka/',
  server: {
    port: 5147,
  },
})
