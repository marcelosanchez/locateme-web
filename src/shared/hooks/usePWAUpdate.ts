import { useState, useEffect, useCallback } from 'react'

interface UsePWAUpdateReturn {
  updateAvailable: boolean
  isUpdating: boolean
  updateServiceWorker: () => Promise<void>
  skipWaiting: () => void
  refreshApp: () => void
  clearAllCaches: () => Promise<void>
  forceUpdate: () => Promise<void>
}

export function usePWAUpdate(): UsePWAUpdateReturn {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newServiceWorker, setNewServiceWorker] = useState<ServiceWorker | null>(null)

  // Check for service worker updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return

      // Check for updates cada 5 minutos (menos agresivo)
      const interval = setInterval(async () => {
        try {
          await registration.update()
        } catch (error) {
          console.warn('Update check failed:', error)
        }
      }, 300000) // 5 minutos

      // Listen for new service worker
      registration.addEventListener('updatefound', () => {
        console.log('📱 New service worker found!')
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker installed, update available
            setUpdateAvailable(true)
            setNewServiceWorker(newWorker)
          }
        })
      })

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Simple reload
        window.location.reload()
      })

      return () => clearInterval(interval)
    })


  }, [])

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (!newServiceWorker) return

    setIsUpdating(true)
    
    try {
      // Tell the new service worker to skip waiting
      newServiceWorker.postMessage({ type: 'SKIP_WAITING' })
      
      // Wait a bit for the new service worker to take control
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Clear all caches before reloading
      await clearAllCaches()
      
      // Reload the page to use the new service worker
      window.location.reload()
    } catch (error) {
      console.error('Failed to update service worker:', error)
      setIsUpdating(false)
    }
  }, [newServiceWorker])

  // Skip waiting for new service worker
  const skipWaiting = useCallback(() => {
    if (!newServiceWorker) return
    newServiceWorker.postMessage({ type: 'SKIP_WAITING' })
  }, [newServiceWorker])

  // Force refresh the app
  const refreshApp = useCallback(() => {
    window.location.reload()
  }, [])

  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    try {
      // Clear all caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      
      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear IndexedDB (if used)
      if ('indexedDB' in window) {
        const dbs = await indexedDB.databases?.() || []
        await Promise.all(
          dbs.map(db => {
            if (db.name) {
              return new Promise((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!)
                deleteReq.onsuccess = () => resolve(undefined)
                deleteReq.onerror = () => reject(deleteReq.error)
              })
            }
            return Promise.resolve()
          })
        )
      }
      
      console.log('All caches cleared successfully')
    } catch (error) {
      console.error('Failed to clear caches:', error)
    }
  }, [])

  // Force update - clear everything and reload
  const forceUpdate = useCallback(async () => {
    setIsUpdating(true)
    
    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(registration => registration.unregister())
        )
      }
      
      // Clear all caches
      await clearAllCaches()
      
      // Add timestamp to force cache bust
      const url = new URL(window.location.href)
      url.searchParams.set('v', Date.now().toString())
      
      // Reload with cache busting
      window.location.href = url.toString()
    } catch (error) {
      console.error('Failed to force update:', error)
      // Fallback: just reload
      window.location.reload()
    }
  }, [clearAllCaches])

  return {
    updateAvailable,
    isUpdating,
    updateServiceWorker,
    skipWaiting,
    refreshApp,
    clearAllCaches,
    forceUpdate
  }
}