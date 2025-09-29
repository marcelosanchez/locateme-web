import { useEffect } from 'react'
import { useTrackingStore } from '../state/trackingStore'
import { useMapStore } from '../state/mapStore'
import { LEGACY_REFRESH_INTERVAL } from '@/config/constants'

export function useAutoTracking(map: maplibregl.Map | null) {
  const trackedDeviceId = useTrackingStore(state => state.trackedDeviceId)
  const getDevicePosition = useMapStore(state => state.getDevicePosition)
  const setCenter = useMapStore(state => state.setCenter)

  useEffect(() => {
    if (!map) return

    const interval = setInterval(() => {
      if (trackedDeviceId) {
        const coords = getDevicePosition(trackedDeviceId)
        if (coords) setCenter(coords)
      } else {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => setCenter([coords.longitude, coords.latitude]),
          (err) => console.warn('[Tracking] Geo fallback error:', err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      }
    }, LEGACY_REFRESH_INTERVAL.tracking)

    return () => clearInterval(interval)
  }, [map, trackedDeviceId])
}
