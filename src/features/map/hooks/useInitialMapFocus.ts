import { useEffect, useState } from 'react'
import { useSelectedDeviceData, useOptimizedData } from '@/shared/providers/OptimizedDataProvider'
import { useMapStore } from '../state/mapStore'
import { useSessionStore } from '@/shared/state/sessionStore'
import { useUserLocationOptimized } from './useUserLocationOptimized'

export function useInitialMapFocus(map: maplibregl.Map | null, mapReady: boolean) {
  const defaultDeviceId = useSessionStore(state => state.user?.default_device_id)
  const { select } = useSelectedDeviceData()
  const { getDevicePosition } = useOptimizedData()
  const setCenter = useMapStore(state => state.setCenter)

  // Use optimized user location hook
  const { userLocation, requestLocation } = useUserLocationOptimized()

  const [hasFlownToBrowser, setHasFlownToBrowser] = useState(false)
  const [hasFlownToDefaultDevice, setHasFlownToDefaultDevice] = useState(false)
  const [manualTracking, setManualTracking] = useState(false)
  const { deviceId: currentlySelectedDeviceId } = useSelectedDeviceData()

  useEffect(() => {
    if (currentlySelectedDeviceId && currentlySelectedDeviceId !== defaultDeviceId) {
      setManualTracking(true)
    }
  }, [currentlySelectedDeviceId, defaultDeviceId])

  // Geolocation effect - simple mobile support
  useEffect(() => {
    if (!map || hasFlownToBrowser) return
    
    // If we have cached location, use it immediately
    if (userLocation) {
      const center = [userLocation.longitude, userLocation.latitude] as [number, number]
      map.jumpTo({ center, zoom: 16 })
      setCenter(center)
      setHasFlownToBrowser(true)
      return
    }
    
    // For mobile devices, try to get location once
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      requestLocation({ allowFallback: true })
        .then((location) => {
          if (location) {
            const center = [location.longitude, location.latitude] as [number, number]
            map.jumpTo({ center, zoom: 16 })
            setCenter(center)
          }
        })
        .catch(() => {
          // Silent fail - no problem if location doesn't work
        })
        .finally(() => {
          setHasFlownToBrowser(true)
        })
    } else {
      // Desktop: don't request location, just continue
      setHasFlownToBrowser(true)
    }
  }, [map, hasFlownToBrowser, userLocation, requestLocation, setCenter])

  useEffect(() => {
    if (!mapReady || !hasFlownToBrowser || hasFlownToDefaultDevice || manualTracking) return
    if (defaultDeviceId) {
      try {
        const position = getDevicePosition(defaultDeviceId) as any
        if (position && position.longitude && position.latitude) {
          const coords: [number, number] = [
            parseFloat(position.longitude as string),
            parseFloat(position.latitude as string)
          ]
          map?.flyTo({ center: coords, zoom: 17 })
          setCenter(coords)
          select(defaultDeviceId)
          setHasFlownToDefaultDevice(true)
        }
      } catch (error) {
        console.warn('[useInitialMapFocus] Error getting device position:', error)
      }
    }
  }, [mapReady, hasFlownToBrowser, hasFlownToDefaultDevice, manualTracking, defaultDeviceId, getDevicePosition, map, setCenter, select])
}
