import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('@mui') || id.includes('react') || id.includes('@emotion')) return 'vendor';
            if (id.includes('katex') || id.includes('remark') || id.includes('rehype')) return 'markdown';
            return 'deps';
          }
        }
      }
    }
  }
})
