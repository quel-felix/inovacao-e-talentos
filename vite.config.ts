import path from 'node:path'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Prefixo '' lê também API_URL e API_KEY; só as VITE_* vão para o bundle,
  // então a chave fica no servidor do Vite e nunca chega ao navegador.
  const env = loadEnv(mode, import.meta.dirname, '')

  // O front chama /api/v1/... no próprio domínio (sem CORS) e o proxy repassa
  // para a api_pesquisadores, injetando o X-API-Key que ela exige.
  const apiProxy: Record<string, ProxyOptions> = {
    '/api': {
      target: env.API_URL || 'http://127.0.0.1:8000',
      changeOrigin: true,
      headers: env.API_KEY ? { 'X-API-Key': env.API_KEY } : undefined,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: { proxy: apiProxy },
    preview: { proxy: apiProxy },
  }
})
