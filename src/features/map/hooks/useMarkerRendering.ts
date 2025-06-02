import { useEffect, useRef } from 'react'
import maplibregl, { Marker } from 'maplibre-gl'
import { renderDeviceMarkers } from '../lib/renderDeviceMarkers'
import { DevicePosition } from '@/types/deviceSnapshot'

export function useMarkerRendering(
  map: maplibregl.Map | null,
  positions: DevicePosition[],
  trackedDeviceId: string | null
) {
  const markersRef = useRef<Marker[]>([])

  useEffect(() => {
    if (!map || positions.length === 0) return
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = renderDeviceMarkers(map, positions, trackedDeviceId)
  }, [map, positions, trackedDeviceId])
}
