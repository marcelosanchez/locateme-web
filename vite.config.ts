import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

const appVersion = process.env.VITE_APP_VERSION || '0.0.0'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon2.png'],
      manifest: {
        name: 'Locateme',
        short_name: 'Locateme',
        start_url: '/',
        display: 'standalone',
        background_color: '#1e1e1e',
        theme_color: '#1e1e1e',
        orientation: 'portrait',
        icons: [
          {
            src: `/icons/web-app-manifest2-192x192.png?v=${appVersion}`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: `/icons/web-app-manifest2-512x512.png?v=${appVersion}`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: `/icons/favicon2-96x96.png?v=${appVersion}`,
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: `/icons/apple-touch-icon2.png?v=${appVersion}`,
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
})
