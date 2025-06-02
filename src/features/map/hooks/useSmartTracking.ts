import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useTrackingStore } from '../state/trackingStore'
import { useMapStore } from '../state/mapStore'

export function useSmartTracking(map: maplibregl.Map | null, mapReady: boolean) {
  const trackedDeviceId = useTrackingStore(state => state.trackedDeviceId)
  const positions = useMapStore(state => state.devicePositions)
  const lastPositionRef = useRef<[number, number] | null>(null)

  useEffect(() => {
    if (!map || !mapReady || !trackedDeviceId) return

    const current = positions[trackedDeviceId]
    const previous = lastPositionRef.current

    const hasChanged = current &&
      (!previous || current[0] !== previous[0] || current[1] !== previous[1])

    if (hasChanged) {
      console.log('[useSmartTracking] flyTo current:', current)
      map.flyTo({ center: current, zoom: 17 }) // lng, lat
      lastPositionRef.current = current
    }
  }, [map, mapReady, trackedDeviceId, positions])
}
