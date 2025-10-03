import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import '@/styles/map-controls.css'
import '@/styles/map-markers.css'

import { useOverviewPositions } from '@/features/devices/hooks/useOverviewPositions'
import { useDeviceHistory } from '@/features/devices/hooks/useDeviceHistory'
import { useMapStore } from '@/features/map/state/mapStore'
import { useTrackingStore } from '@/features/map/state/trackingStore'
import { filterDistantEnough } from '@/shared/utils/geo'
import { MAP_COLORS } from '@/config/mapColors'

import { initMap } from '@/features/map/lib/initMap'
import { useInitialMapFocus } from '@/features/map/hooks/useInitialMapFocus'
import { useSmartTracking } from '../hooks/useSmartTracking'
import { useDeviceTrackingFlow } from '../hooks/useDeviceTrackingFlow'

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)
  const routeLineIdsRef = useRef<string[]>([])
  const historyMarkersRef = useRef<maplibregl.Marker[]>([])

  // Use individual hooks instead of OptimizedDataProvider
  const positions = useOverviewPositions()
  const trackedDeviceId = useTrackingStore(state => state.trackedDeviceId)
  const history = useDeviceHistory(trackedDeviceId)
  const deviceRoute: any[] = [] // TODO: Implement device route hook if needed

  const [mapReady, setMapReady] = useState(false)

  // Draw device history function
  const drawHistory = () => {
    if (!mapInstance.current || !trackedDeviceId || history.length < 2) return

    const coords = filterDistantEnough(
      history
        .map(p => [parseFloat(p.longitude), parseFloat(p.latitude)] as [number, number])
        .filter(([lng, lat]) => !isNaN(lat) && !isNaN(lng))
    )

    const map = mapInstance.current

    // clean up previous markers
    historyMarkersRef.current.forEach(m => m.remove())
    historyMarkersRef.current = []

    // draw history points
    coords.forEach(([lng, lat]) => {
      const el = document.createElement('div')
      el.style.width = '10px'
      el.style.height = '10px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = MAP_COLORS.historyPoint.fill
      el.style.boxShadow = `0 0 4px ${MAP_COLORS.historyPoint.shadow}`

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map)

      historyMarkersRef.current.push(marker)
    })

    // clear previous route lines
    routeLineIdsRef.current.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(id)) map.removeSource(id)
    })
    routeLineIdsRef.current = []

    for (let i = 0; i < coords.length - 1; i++) {
      const start = coords[i]
      const end = coords[i + 1]
      const factor = (i + 1) / (coords.length - 1)
      const opacity = 1.0 - factor * 0.8
      const id = `history-line-${i}`

      map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [start, end],
          },
          properties: {},
        },
      })

      map.addLayer({
        id,
        type: 'line',
        source: id,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': MAP_COLORS.routeLine.stroke,
          'line-width': 4,
          'line-opacity': opacity,
        },
      })

      routeLineIdsRef.current.push(id)
    }
  }

  // focus: browser location → default device
  useInitialMapFocus(mapInstance.current, mapReady)

  // smart tracking: fly to device position if it changes
  useSmartTracking(mapInstance.current, mapReady)

  // Pass all positions to the tracking flow (it will filter invalid coordinates internally)
  useDeviceTrackingFlow(mapInstance.current, positions, (deviceRoute || []) as any, trackedDeviceId)

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

    map.on('moveend', drawHistory)

    return () => {
      map.off('moveend', drawHistory)
      map.remove()
      mapInstance.current = null
    }
  }, [])

  // Draw history when history data changes
  useEffect(() => {
    drawHistory()
  }, [history, trackedDeviceId])

  return <div ref={mapRef} className="fixed top-0 left-0 h-screen w-screen z-0" />
}
