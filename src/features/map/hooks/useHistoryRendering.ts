import { useEffect, useRef } from 'react'
import { Marker } from 'maplibre-gl'
import { renderHistory } from '../lib/renderHistory'
import { DevicePosition } from '@/types/deviceSnapshot'

export function useHistoryRendering(
  map: maplibregl.Map | null,
  history: DevicePosition[],
  trackedDeviceId: string | null
) {
  const historyMarkersRef = useRef<Marker[]>([])
  const routeLineIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!map || !trackedDeviceId) return
    renderHistory(map, history, trackedDeviceId, historyMarkersRef, routeLineIdsRef)
  }, [map, history, trackedDeviceId])
}
