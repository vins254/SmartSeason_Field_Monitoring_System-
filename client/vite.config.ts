/**
 * Vite Configuration
 * 
 * Purpose:
 * Configures the build system for the frontend application.
 * 
 * How it works:
 * 1. Enables React support via @vitejs/plugin-react.
 * 2. Sets up the '@' path alias for cleaner imports from the 'src' directory.
 * 3. Configures a development proxy to redirect /api calls to the backend server (port 3000).
 */

import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})