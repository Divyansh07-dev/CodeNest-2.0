// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Only keep this if you still need local proxy during development
  // (remove or comment out for production build)
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/problem': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/submission': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // add more prefixes as needed
    }
    // Remove historyApiFallback — it breaks nothing but is useless
  },

  // Optional: if you want to change base path (rarely needed)
  // base: '/'
})