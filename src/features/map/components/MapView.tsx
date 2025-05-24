import { useEffect, useRef } from 'react'
import { renderToString } from 'react-dom/server'
import maplibregl, { NavigationControl, GeolocateControl, Marker, Popup } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import '@/styles/map-controls.css'
import '@/styles/map-markers.css'

import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM, MAX_ZOOM } from '@/config/constants'
import type { DevicePosition } from '@/types/deviceSnapshot'
import { useLatestDevicePositions } from '@/features/devices/hooks/useLatestDevicePositions'
import { DevicePopup } from '@/features/devices/components/DevicePopup'
import { useMapStore } from '../state/mapStore'

import { useTrackingStore } from '@/features/map/state/trackingStore'
import { useDeviceHistory } from '@/features/devices/hooks/useDeviceHistory'
import { filterDistantEnough } from '@/shared/utils/geo'
import { MAP_COLORS } from '@/config/mapColors'

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Marker[]>([])
  const routeLineIdsRef = useRef<string[]>([])
  const historyMarkersRef = useRef<Marker[]>([])

  const positions = useLatestDevicePositions()
  const trackedDeviceId = useTrackingStore(state => state.trackedDeviceId)
  const history = useDeviceHistory(trackedDeviceId)

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

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: import.meta.env.VITE_MAPTILER_URL,
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
    })

    mapInstance.current = map

    useMapStore.setState({
      setCenter: ([lng, lat]) => {
        map.flyTo({ center: [lng, lat], zoom: 17 })
      },
    })

    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: false,
      }),
      'bottom-right'
    )

    map.on('moveend', drawHistory)

    return () => {
      map.off('moveend', drawHistory)
      map.remove()
      mapInstance.current = null
    }
  }, [])

  // update markers and track selected device
  useEffect(() => {
    if (!mapInstance.current || positions.length === 0) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    positions.forEach((pos: DevicePosition) => {
      const lat = parseFloat(pos.latitude)
      const lng = parseFloat(pos.longitude)
      if (isNaN(lat) || isNaN(lng)) return

      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.width = '42px'
      el.style.height = '42px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = '#48484a'
      el.style.border = '2px solid #636365'
      el.style.display = 'flex'
      el.style.justifyContent = 'center'
      el.style.alignItems = 'center'
      el.style.fontSize = '22px'
      el.style.color = 'white'
      el.style.userSelect = 'none'
      el.innerText = pos.device_icon || '📍'

      // pulse effect for tracked device
      if (pos.device_id === trackedDeviceId) {
        const ring = document.createElement('div')
        ring.className = 'pulse-ring'
        el.appendChild(ring)
      }

      const popupHtml = renderToString(<DevicePopup device={pos} />)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new Popup({ offset: 25, closeButton: false }).setHTML(popupHtml))
        .addTo(mapInstance.current!)

      markersRef.current.push(marker)

      // auto-track selected device
      if (trackedDeviceId && pos.device_id === trackedDeviceId) {
        mapInstance.current!.flyTo({ center: [lng, lat], zoom: 17 })
      }
    })
  }, [positions, trackedDeviceId])

  useEffect(() => {
    drawHistory()
  }, [history, trackedDeviceId])

  return <div ref={mapRef} className="fixed top-0 left-0 h-screen w-screen z-0" />
}
