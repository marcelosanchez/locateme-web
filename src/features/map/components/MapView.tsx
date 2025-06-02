import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import '@/styles/map-controls.css'
import '@/styles/map-markers.css'

import { useOverviewPositions } from '@/features/devices/hooks/useOverviewPositions'
import { useDeviceHistory } from '@/features/devices/hooks/useDeviceHistory'

import { useTrackingStore } from '@/features/map/state/trackingStore'
import { useMapStore } from '@/features/map/state/mapStore'

import { initMap } from '@/features/map/lib/initMap'
import { useInitialMapFocus } from '@/features/map/hooks/useInitialMapFocus'
import { useSmartTracking } from '../hooks/useSmartTracking'
import { useDeviceTrackingFlow } from '../hooks/useDeviceTrackingFlow'
import { useSidebarDevices } from '@/features/devices/hooks/useSidebarDevices'

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  const positions = useOverviewPositions()
  useSidebarDevices() // preload devices into sidebar
  const trackedDeviceId = useTrackingStore(state => state.trackedDeviceId)
  const history = useDeviceHistory(trackedDeviceId)

  const [mapReady, setMapReady] = useState(false)

  // focus: browser location → default device
  useInitialMapFocus(mapInstance.current, mapReady)

  // smart tracking: fly to device position if it changes
  useSmartTracking(mapInstance.current, mapReady)

  // render device markers and history
  useDeviceTrackingFlow(mapInstance.current, positions, history, trackedDeviceId)

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
