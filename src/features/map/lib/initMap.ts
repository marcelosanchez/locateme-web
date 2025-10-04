import maplibregl, { NavigationControl, GeolocateControl } from 'maplibre-gl'
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from '@/config/constants'

export function initMap(container: HTMLDivElement, onMoveEnd?: () => void): maplibregl.Map {
  // Fallback to osm-dark.json if findmy-dark.json fails (missing API key)
  const mapStyle = import.meta.env.VITE_MAPTILER_URL || '/map-styles/osm-dark.json'
  
  const map = new maplibregl.Map({
    container,
    style: mapStyle,
    center: DEFAULT_MAP_CENTER,
    zoom: DEFAULT_ZOOM,
    attributionControl: false,
    maxZoom: 18,
  })

  // Add error handler for map style loading failures
  map.on('error', (e) => {
    console.warn('[Map] Style loading failed, falling back to OSM dark theme:', e)
    if (mapStyle !== '/map-styles/osm-dark.json') {
      map.setStyle('/map-styles/osm-dark.json')
    }
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
