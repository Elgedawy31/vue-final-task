import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:3002',
      '/data': {
        target: 'http://127.0.0.1:3001',
        rewrite: path => path.replace(/^\/data/, ''),
      },
    },
  },
})
