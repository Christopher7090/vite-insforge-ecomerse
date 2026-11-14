import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, import.meta.dirname, 'VITE_')
  const backend = env.VITE_INSFORGE_URL || 'https://y74su2bv.us-east.insforge.app'


  const proxy = {
    '/api': { target: backend, changeOrigin: true },
    '/functions': { target: backend, changeOrigin: true },
  }

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})
