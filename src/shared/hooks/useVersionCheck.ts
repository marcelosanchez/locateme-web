import { useEffect, useState } from 'react'

interface VersionInfo {
  version: string
  buildTime: string
  hash: string
}

export function useVersionCheck() {
  const [needsUpdate, setNeedsUpdate] = useState(false)

  useEffect(() => {
    const checkVersion = async () => {
      try {
        console.log('🔍 Checking app version...')
        
        // Obtener versión actual del build
        const response = await fetch('/version.json?_t=' + Date.now(), {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        if (!response.ok) {
          console.warn('Version check failed:', response.status)
          return
        }

        const serverVersion: VersionInfo = await response.json()
        const storedVersion = localStorage.getItem('app_version')
        
        console.log('📱 Server version:', serverVersion.version)
        console.log('📱 Stored version:', storedVersion)

        if (storedVersion && storedVersion !== serverVersion.version) {
          console.log('🚀 New version detected! Forcing update...')
          setNeedsUpdate(true)
          
          // Auto-update después de 2 segundos
          setTimeout(() => {
            localStorage.setItem('app_version', serverVersion.version)
            forceCompleteReload()
          }, 2000)
        } else if (!storedVersion) {
          localStorage.setItem('app_version', serverVersion.version)
        }

      } catch (error) {
        console.warn('Version check error:', error)
      }
    }

    const forceCompleteReload = () => {
      console.log('🔄 Performing complete app reload...')
      
      // Limpiar todo el storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Cache busting URL
      const url = new URL(window.location.href)
      url.searchParams.set('v', Date.now().toString())
      url.searchParams.set('force', 'true')
      
      // Redireccionar con cache busting
      window.location.href = url.toString()
    }

    // Check inmediato
    checkVersion()

    // Check cada 20 segundos
    const interval = setInterval(checkVersion, 20000)

    return () => clearInterval(interval)
  }, [])

  return { needsUpdate }
}