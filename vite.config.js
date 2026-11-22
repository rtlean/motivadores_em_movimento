import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local: `netlify dev` serve as funções em /api (porta 8888); com `npm run dev` puro, o proxy aponta para ele.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8888' } }
})
