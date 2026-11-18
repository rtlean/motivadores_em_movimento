import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local: `vercel dev` serves /api; with plain `npm run dev`, point the proxy to it.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } }
})
