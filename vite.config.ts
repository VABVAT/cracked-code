import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  // ! only information regarding build 
  // The base: './' setting ensures that assets (CSS, JS) are loaded relative to the deployment path, not from the root.
  base: './',
  // react build should be in dist-react
  build:{
    outDir: 'dist-react'
  },
  server:{
    port:3000,
    strictPort:true
  }
})
