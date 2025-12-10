import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // allow access from network / external hosts
    allowedHosts: [
      // exact host
      'alyse-azido-unlyrically.ngrok-free.dev',
      // OR use RegExp to allow all ngrok free subdomains
      /^.*\.ngrok-free\.dev$/,
    ],
  }
})
