import { useState, useEffect, useCallback } from 'react'

interface VersionInfo {
  version: string
  buildTime: string
  hash: string
}

interface UseAppVersionReturn {
  version: string
  buildInfo: VersionInfo | null
  updateAvailable: boolean
  isUpdating: boolean
  forceUpdate: () => Promise<void>
  checkForUpdates: () => Promise<void>
}

export function useAppVersion(): UseAppVersionReturn {
  // Versión base desde el environment (viene del package.json)
  const baseVersion = import.meta.env.VITE_APP_VERSION || '1.1.2'
  
  const [buildInfo, setBuildInfo] = useState<VersionInfo | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Detectar si es móvil/Brave para estrategias específicas
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isBrave = navigator.userAgent.includes('Brave') || (navigator as any).brave
  const isSpecialDevice = isMobile || isBrave

  // Función para obtener info de versión del servidor
  const fetchVersionInfo = useCallback(async (): Promise<VersionInfo | null> => {
    try {
      const response = await fetch('/version.json?_t=' + Date.now(), {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        console.warn('Version info fetch failed:', response.status)
        return null
      }

      const versionInfo: VersionInfo = await response.json()
      return versionInfo
    } catch (error) {
      console.warn('Version info fetch error:', error)
      return null
    }
  }, [])

  // Función para verificar actualizaciones
  const checkForUpdates = useCallback(async () => {
    const serverInfo = await fetchVersionInfo()
    if (!serverInfo) return

    setBuildInfo(serverInfo)

    // Comparar versiones
    const storedVersion = localStorage.getItem('app_version')
    const storedBuildTime = localStorage.getItem('app_build_time')

    // Detectar si hay actualización disponible
    const hasVersionUpdate = storedVersion && storedVersion !== serverInfo.version
    const hasBuildUpdate = storedBuildTime && storedBuildTime !== serverInfo.buildTime

    if (hasVersionUpdate || hasBuildUpdate) {
      console.log('🚀 Update detected! Setting update available...')
      setUpdateAvailable(true)

      // Auto-update más agresivo en dispositivos especiales
      if (isSpecialDevice) {
        console.log('📱 Special device detected - Auto-updating in 2 seconds...')
        setTimeout(() => {
          forceUpdate()
        }, 2000)
      } else {
        console.log('🖥️ Desktop detected - Auto-updating in 5 seconds...')
        setTimeout(() => {
          forceUpdate()
        }, 5000)
      }
    } else {
      // Primera vez o misma versión
      if (!storedVersion || !storedBuildTime) {
        localStorage.setItem('app_version', serverInfo.version)
        localStorage.setItem('app_build_time', serverInfo.buildTime)
        console.log('📱 Version info stored for first time')
      }
    }
  }, [fetchVersionInfo, baseVersion, isSpecialDevice])

  // Función para forzar actualización completa
  const forceUpdate = useCallback(async () => {
    if (isUpdating) return

    setIsUpdating(true)
    console.log('🔄 Starting force update process...')

    try {
      // 1. Desregistrar service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map(reg => reg.unregister()))
        console.log('✅ Service workers unregistered')
      }

      // 2. Limpiar todos los caches
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('✅ All caches cleared')

      // 3. Limpiar storage (pero guardar versión nueva)
      const newBuildInfo = buildInfo
      localStorage.clear()
      sessionStorage.clear()
      
      if (newBuildInfo) {
        localStorage.setItem('app_version', newBuildInfo.version)
        localStorage.setItem('app_build_time', newBuildInfo.buildTime)
      }
      console.log('✅ Storage cleared and version updated')

      // 4. Limpiar cookies
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      console.log('✅ Cookies cleared')

      // 5. Recarga con cache busting
      const url = new URL(window.location.href)
      url.searchParams.set('v', Date.now().toString())
      url.searchParams.set('force', 'true')
      
      console.log('🚀 Reloading with cache busting...')
      window.location.href = url.toString()

    } catch (error) {
      console.error('❌ Force update error:', error)
      // Fallback: reload simple
      window.location.reload()
    }
  }, [isUpdating, buildInfo])

  // Auto-check inicial y periódico (menos agresivo)
  useEffect(() => {
    // Check inmediato
    checkForUpdates()

    // Intervalo menos agresivo
    const interval = 60000 // 1 minuto para todos
    const intervalId = setInterval(checkForUpdates, interval)

    return () => clearInterval(intervalId)
  }, [checkForUpdates])

  // Service Worker integration
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleSWUpdate = () => {
      checkForUpdates()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate)
    navigator.serviceWorker.addEventListener('message', handleSWUpdate)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate)
      navigator.serviceWorker.removeEventListener('message', handleSWUpdate)
    }
  }, [checkForUpdates])

  return {
    version: buildInfo?.version || baseVersion,
    buildInfo,
    updateAvailable,
    isUpdating,
    forceUpdate,
    checkForUpdates
  }
}