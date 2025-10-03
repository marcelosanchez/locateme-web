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
      }
      // Removed automatic geolocation fallback to prevent CoreLocationProvider errors
      // Users can manually enable location if needed
    }, LEGACY_REFRESH_INTERVAL.tracking)

    return () => clearInterval(interval)
  }, [map, trackedDeviceId])
}
