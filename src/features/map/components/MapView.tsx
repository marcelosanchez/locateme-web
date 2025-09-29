import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import '@/styles/map-controls.css'
import '@/styles/map-markers.css'

import { useMapData, useSelectedDeviceData } from '@/shared/providers/OptimizedDataProvider'
import { useMapStore } from '@/features/map/state/mapStore'

import { initMap } from '@/features/map/lib/initMap'
import { useInitialMapFocus } from '@/features/map/hooks/useInitialMapFocus'
import { useSmartTracking } from '../hooks/useSmartTracking'
import { useDeviceTrackingFlow } from '../hooks/useDeviceTrackingFlow'

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  // Use optimized data hooks
  const { positions } = useMapData()
  const { route: deviceRoute, deviceId: trackedDeviceId } = useSelectedDeviceData()

  const [mapReady, setMapReady] = useState(false)

  // focus: browser location → default device
  useInitialMapFocus(mapInstance.current, mapReady)

  // smart tracking: fly to device position if it changes
  useSmartTracking(mapInstance.current, mapReady)

  // render device markers and history (with optimized data) - filter out null coordinates
  const validPositions = (positions || [])
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      ...p,
      latitude: p.latitude!,
      longitude: p.longitude!,
      readable_datetime: p.readable_datetime!
    })) as any
  useDeviceTrackingFlow(mapInstance.current, validPositions, (deviceRoute || []) as any, trackedDeviceId)

  // initialize map instance
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = initMap(mapRef.current)
    mapInstance.current = map

    useMapStore.setState({
      setCenter: ([lng, lat]) => {
        // console.log('[MapView.tsx] flyTo lng/lat:', lng, lat)
        map.flyTo({ center: [lng, lat], zoom: 17 })
      },
    })

    setMapReady(true)

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  return <div ref={mapRef} className="fixed top-0 left-0 h-screen w-screen z-0" />
}
