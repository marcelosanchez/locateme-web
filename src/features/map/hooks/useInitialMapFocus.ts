import { useEffect, useState } from 'react'
import { useTrackingStore } from '../state/trackingStore'
import { useMapStore } from '../state/mapStore'
import { useSessionStore } from '@/shared/state/sessionStore'

export function useInitialMapFocus(map: maplibregl.Map | null, mapReady: boolean) {
  const defaultDeviceId = useSessionStore(state => state.user?.default_device_id)
  const setTrackedDeviceId = useTrackingStore(state => state.setTrackedDeviceId)
  const getDevicePosition = useMapStore(state => state.getDevicePosition)
  const setCenter = useMapStore(state => state.setCenter)

  const [hasFlownToBrowser, setHasFlownToBrowser] = useState(false)
  const [hasFlownToDefaultDevice, setHasFlownToDefaultDevice] = useState(false)
  const [manualTracking, setManualTracking] = useState(false)

  useEffect(() => {
    const unsub = useTrackingStore.subscribe((state) => {
      if (state.trackedDeviceId && state.trackedDeviceId !== defaultDeviceId) {
        setManualTracking(true)
      }
    })
    return () => unsub()
  }, [defaultDeviceId])

  useEffect(() => {
    if (!map || hasFlownToBrowser) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const center = [coords.longitude, coords.latitude] as [number, number]
        // console.log('[useInitialMapFocus] flyTo coords:', center)
        map.flyTo({ center, zoom: 16 })
        setCenter(center)
        setHasFlownToBrowser(true)
      },
      () => setHasFlownToBrowser(true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [map, hasFlownToBrowser, setCenter])

  useEffect(() => {
    if (!mapReady || !hasFlownToBrowser || hasFlownToDefaultDevice || manualTracking) return
    if (defaultDeviceId) {
      const coords = getDevicePosition(defaultDeviceId)
      if (coords) {
        map?.flyTo({ center: coords, zoom: 17 })
        setCenter(coords)
        setTrackedDeviceId(defaultDeviceId)
        setHasFlownToDefaultDevice(true)
      }
    }
  }, [mapReady, hasFlownToBrowser, hasFlownToDefaultDevice, manualTracking, defaultDeviceId])
}
