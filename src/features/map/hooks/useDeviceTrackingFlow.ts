import { useEffect, useRef } from 'react'
import { Marker } from 'maplibre-gl'
import { DevicePosition } from '@/types/deviceSnapshot'
import { renderDeviceMarkers } from '../lib/renderDeviceMarkers'
import { renderHistory } from '../lib/renderHistory'
import { useMapStore } from '@/features/map/state/mapStore'


export function useDeviceTrackingFlow(
  map: maplibregl.Map | null,
  positions: DevicePosition[],
  history: DevicePosition[],
  trackedDeviceId: string | null
) {
  const markersRef = useRef<Marker[]>([])
  const historyMarkersRef = useRef<Marker[]>([])
  const routeLineIdsRef = useRef<string[]>([])
  const setCenter = useMapStore(state => state.setCenter)

  // render all device markers
  useEffect(() => {
    if (!map || positions.length === 0) return

    // center the map if tracked device exists
    if (trackedDeviceId) {
      const tracked = positions.find(p => p.device_id === trackedDeviceId)
      const lat = parseFloat(tracked?.latitude || '')
      const lng = parseFloat(tracked?.longitude || '')
      if (!isNaN(lat) && !isNaN(lng)) {
        setCenter([lng, lat])
      }
    }

    // clear and render all markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = renderDeviceMarkers(map, positions, trackedDeviceId)
  }, [map, positions, trackedDeviceId, setCenter])

  // render tracked device history
  useEffect(() => {
    if (!map || !trackedDeviceId || history.length < 2) return

    renderHistory(map, history, trackedDeviceId, historyMarkersRef, routeLineIdsRef)
  }, [map, history, trackedDeviceId])
}
