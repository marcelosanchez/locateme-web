import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'
import { writeFileSync } from 'fs'
import { join } from 'path'

// Get version from package.json
import packageJson from './package.json'
const appVersion = process.env.VITE_APP_VERSION || packageJson.version

// Generate version.json for mobile update detection
const generateVersionFile = () => ({
  name: 'generate-version',
  buildStart() {
    const versionInfo = {
      version: appVersion,
      buildTime: new Date().toISOString(),
      hash: Math.random().toString(36).substring(2, 15)
    }
    
    writeFileSync(
      join(__dirname, 'public', 'version.json'),
      JSON.stringify(versionInfo, null, 2)
    )
    
    console.log('📱 Generated version.json:', versionInfo)
  }
})

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
  },
  plugins: [
    generateVersionFile(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
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
