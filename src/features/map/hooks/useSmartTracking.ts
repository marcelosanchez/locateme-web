import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useSelectedDeviceData } from '@/shared/providers/OptimizedDataProvider'
import { useMapStore } from '../state/mapStore'

export function useSmartTracking(map: maplibregl.Map | null, mapReady: boolean) {
  const { device: selectedDevice, deviceId: trackedDeviceId } = useSelectedDeviceData()
  const setCenter = useMapStore(state => state.setCenter)
  const lastPositionRef = useRef<[number, number] | null>(null)

  useEffect(() => {
    if (!map || !mapReady || !trackedDeviceId || !selectedDevice?.latest_position) return

    const position = selectedDevice.latest_position
    const current: [number, number] = [
      parseFloat(position.longitude), 
      parseFloat(position.latitude)
    ]
    const previous = lastPositionRef.current

    const hasChanged = !previous || current[0] !== previous[0] || current[1] !== previous[1]

    if (hasChanged) {
      console.log('[useSmartTracking] flyTo current:', current)
      map.flyTo({ center: current, zoom: 17 })
      setCenter(current)
      lastPositionRef.current = current
    }
  }, [map, mapReady, trackedDeviceId, selectedDevice, setCenter])
}
