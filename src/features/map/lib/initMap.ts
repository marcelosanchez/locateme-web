import maplibregl, { NavigationControl, GeolocateControl } from 'maplibre-gl'
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from '@/config/constants'
import { MapCache } from '@/config/map.config'

export function initMap(container: HTMLDivElement, initialCenter?: [number, number], onMoveEnd?: () => void): maplibregl.Map {
  // Initialize tile cache on first map creation
  MapCache.initTileCache().catch(() => {
    // Silent fail - caching is an enhancement, not critical
  })
  
  // ALWAYS use findmy-dark.json theme - VITAL requirement
  const mapStyle = '/map-styles/findmy-dark.json'
  
  const map = new maplibregl.Map({
    container,
    style: mapStyle,
    center: initialCenter || DEFAULT_MAP_CENTER,
    zoom: DEFAULT_ZOOM, // Always start with zoom 3 for initial fly effect
    attributionControl: false,
    maxZoom: 18
    // Removed transformRequest to avoid CORS issues with MapTiler
  })

  // Add error handler for map style loading failures
  map.on('error', (e) => {
    console.warn('[Map] findmy-dark.json failed, falling back to OSM dark theme:', e)
    // If findmy-dark.json fails (API key issues), fallback to OSM
    map.setStyle('/map-styles/osm-dark.json')
  })

  // Preload tiles when map is ready and user location is available
  map.on('load', () => {
    // Try to get user location for tile preloading
    const storedLocation = localStorage.getItem('userLocation')
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation)
        if (location.latitude && location.longitude) {
          // Preload tiles in background
          MapCache.preloadTilesAroundLocation(location.longitude, location.latitude)
            .catch(() => {
              // Silent fail - tile preloading is an enhancement
            })
        }
      } catch (error) {
        console.warn('[MapCache] Failed to parse stored location for preloading')
      }
    }
  })

  map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
  map.addControl(
    new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false, // Disable to prevent conflicts with our location system
      showAccuracyCircle: false,
      showUserLocation: false
    }),
    'top-right'
  )

  if (onMoveEnd) map.on('moveend', onMoveEnd)

  return map
}
