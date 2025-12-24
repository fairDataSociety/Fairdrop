import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Proxy for FDS gateway (CORS bypass in development)
      '/api/swarm': {
        target: 'https://gateway.fairdatasociety.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/swarm/, '')
      },
      // Proxy for free stamp API
      '/api/free-stamp': {
        target: 'https://gateway.fairdatasociety.org',
        changeOrigin: true
      }
    }
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  }
  // Note: Removed fds.js alias - now using ./lib/fds-adapter directly
})
