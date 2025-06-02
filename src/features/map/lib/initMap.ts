import maplibregl, { NavigationControl, GeolocateControl } from 'maplibre-gl'
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from '@/config/constants'

export function initMap(container: HTMLDivElement, onMoveEnd?: () => void): maplibregl.Map {
  const map = new maplibregl.Map({
    container,
    style: import.meta.env.VITE_MAPTILER_URL,
    center: DEFAULT_MAP_CENTER,
    zoom: DEFAULT_ZOOM,
    attributionControl: false,
    maxZoom: 18,
  })

  map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
  map.addControl(
    new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: false,
    }),
    'top-right'
  )

  if (onMoveEnd) map.on('moveend', onMoveEnd)

  return map
}
