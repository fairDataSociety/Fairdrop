import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      // Proxy for local Bee node (CORS bypass)
      '/bee': {
        target: 'http://localhost:1633',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bee/, ''),
      },
      // Proxy for FDS gateway (CORS bypass in development)
      '/api/swarm': {
        target: 'https://gateway.fairdatasociety.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/swarm/, ''),
      },
      // Proxy for free stamp API
      '/api/free-stamp': {
        target: 'https://gateway.fairdatasociety.org',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          swarm: ['@ethersphere/bee-js'],
          wallet: ['ethers', '@reown/appkit', '@reown/appkit-adapter-ethers'],
        },
      },
    },
  },
})
