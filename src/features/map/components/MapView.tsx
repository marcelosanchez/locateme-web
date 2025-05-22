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
import { useTrackingStore } from '../state/trackingStore'

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Marker[]>([])
  const positions = useLatestDevicePositions()
  const trackedDeviceId = useTrackingStore(state => state.trackedDeviceId)

  // init map
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

    return () => {
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

  return <div ref={mapRef} className="fixed top-0 left-0 h-screen w-screen z-0" />
}
