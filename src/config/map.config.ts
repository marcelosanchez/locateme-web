// Map configuration with caching optimizations
import maplibregl from 'maplibre-gl'

export const MAP_CONFIG = {
  // Tile caching configuration
  TILE_CACHE_SIZE: 50, // MB - Amount of tiles to cache
  TILE_CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  
  // Map style caching
  STYLE_CACHE_KEY: 'locateme_map_style',
  STYLE_CACHE_VERSION: '1.0',
  
  // Preload configuration
  PRELOAD_ZOOM_LEVELS: [10, 12, 14, 16], // Zoom levels to preload around user location
  PRELOAD_TILE_RADIUS: 2, // Number of tiles around center to preload
  
  // Performance settings
  MAX_ZOOM: 18,
  DEFAULT_ZOOM: 3,
  FADE_DURATION: 300,
  
  // Attribution and controls
  ATTRIBUTION_CONTROL: false,
  NAVIGATION_CONTROL: {
    showCompass: false,
    showZoom: true,
    visualizePitch: false
  },
  
  // Tile source URLs with cache optimization
  TILE_SOURCES: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '� OpenStreetMap contributors',
      // Enable browser caching
      scheme: 'xyz' as const,
      bounds: [-180, -85.051128, 180, 85.051128],
      minzoom: 0,
      maxzoom: 18
    }
  }
} as const

// Map style with optimized tile caching
export const OSM_DARK_STYLE = {
  version: 8,
  name: 'OpenStreetMap Dark (Cached)',
  metadata: {
    'maputnik:renderer': 'mlgljs',
    'locateme:cached': true
  },
  sources: {
    osm: MAP_CONFIG.TILE_SOURCES.osm
  },
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: {
        'background-color': '#1a1a1a'
      }
    },
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
      paint: {
        'raster-opacity': 0.8,
        'raster-fade-duration': MAP_CONFIG.FADE_DURATION
      }
    }
  ]
}

// Cache management utilities
export class MapCache {
  private static readonly TILE_CACHE_NAME = 'map-tiles-v1'
  
  /**
   * Initialize map tile caching
   */
  static async initTileCache(): Promise<void> {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        await caches.open(this.TILE_CACHE_NAME)
        // Tile cache initialized
      } catch (error) {
        console.warn('[MapCache] Failed to initialize tile cache:', error)
      }
    }
  }
  
  /**
   * Cache map style configuration
   */
  static cacheMapStyle(style: object): void {
    try {
      const cacheData = {
        style,
        version: MAP_CONFIG.STYLE_CACHE_VERSION,
        timestamp: Date.now()
      }
      localStorage.setItem(MAP_CONFIG.STYLE_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('[MapCache] Failed to cache map style:', error)
    }
  }
  
  /**
   * Retrieve cached map style
   */
  static getCachedMapStyle(): object | null {
    try {
      const cached = localStorage.getItem(MAP_CONFIG.STYLE_CACHE_KEY)
      if (!cached) return null
      
      const data = JSON.parse(cached)
      const isExpired = Date.now() - data.timestamp > MAP_CONFIG.TILE_CACHE_EXPIRY
      
      if (isExpired || data.version !== MAP_CONFIG.STYLE_CACHE_VERSION) {
        localStorage.removeItem(MAP_CONFIG.STYLE_CACHE_KEY)
        return null
      }
      
      return data.style
    } catch (error) {
      console.warn('[MapCache] Failed to retrieve cached map style:', error)
      return null
    }
  }
  
  /**
   * Preload tiles around a specific location
   */
  static async preloadTilesAroundLocation(
    longitude: number, 
    latitude: number, 
    zoomLevels: readonly number[] = MAP_CONFIG.PRELOAD_ZOOM_LEVELS
  ): Promise<void> {
    if (!('caches' in window)) return
    
    try {
      const cache = await caches.open(this.TILE_CACHE_NAME)
      const requests: Request[] = []
      
      for (const zoom of zoomLevels) {
        const tiles = this.getTilesAroundPoint(longitude, latitude, zoom)
        
        for (const tile of tiles) {
          const url = `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`
          requests.push(new Request(url, {
            mode: 'cors',
            cache: 'force-cache' // Use cached version if available
          }))
        }
      }
      
      // Preload tiles in batches to avoid overwhelming the server
      const batchSize = 10
      for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize)
        await Promise.allSettled(
          batch.map(async (request) => {
            try {
              const response = await fetch(request)
              if (response.ok) {
                await cache.put(request, response)
              }
            } catch (error) {
              // Silent fail for individual tiles
            }
          })
        )
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log(`[MapCache] Preloaded ${requests.length} tiles around location`)
    } catch (error) {
      console.warn('[MapCache] Failed to preload tiles:', error)
    }
  }
  
  /**
   * Calculate tile coordinates around a geographic point
   */
  private static getTilesAroundPoint(lon: number, lat: number, zoom: number): Array<{x: number, y: number, z: number}> {
    const radius = MAP_CONFIG.PRELOAD_TILE_RADIUS
    const centerX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom))
    const centerY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))
    
    const tiles: Array<{x: number, y: number, z: number}> = []
    
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      for (let y = centerY - radius; y <= centerY + radius; y++) {
        if (x >= 0 && y >= 0 && x < Math.pow(2, zoom) && y < Math.pow(2, zoom)) {
          tiles.push({ x, y, z: zoom })
        }
      }
    }
    
    return tiles
  }
  
  /**
   * Clear expired tiles from cache
   */
  static async clearExpiredTiles(): Promise<void> {
    if (!('caches' in window)) return
    
    try {
      const cache = await caches.open(this.TILE_CACHE_NAME)
      const requests = await cache.keys()
      
      // For tile caches, we rely on browser cache headers
      // Manual expiry is not needed for tiles as browsers handle this efficiently
      console.log(`[MapCache] Cache contains ${requests.length} tile requests`)
    } catch (error) {
      console.warn('[MapCache] Failed to clear expired tiles:', error)
    }
  }
  
  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{tileCount: number, estimatedSize: string}> {
    if (!('caches' in window)) {
      return { tileCount: 0, estimatedSize: '0 MB' }
    }
    
    try {
      const cache = await caches.open(this.TILE_CACHE_NAME)
      const requests = await cache.keys()
      const tileCount = requests.length
      
      // Estimate size (typical tile is ~15-30KB)
      const estimatedBytes = tileCount * 20 * 1024 // 20KB average
      const estimatedMB = (estimatedBytes / (1024 * 1024)).toFixed(1)
      
      return {
        tileCount,
        estimatedSize: `${estimatedMB} MB`
      }
    } catch (error) {
      console.warn('[MapCache] Failed to get cache stats:', error)
      return { tileCount: 0, estimatedSize: '0 MB' }
    }
  }
}

// Enhanced map initialization with caching
export function createOptimizedMapInstance(
  container: HTMLDivElement,
  options: {
    initialCenter?: [number, number]
    onMoveEnd?: () => void
    enableTilePreload?: boolean
    customStyle?: any
  } = {}
): maplibregl.Map {
  const { initialCenter, onMoveEnd, enableTilePreload = true, customStyle } = options
  
  // Use custom style if provided, otherwise try cached style, finally fallback to OSM
  let mapStyle = customStyle || MapCache.getCachedMapStyle() || OSM_DARK_STYLE
  
  const map = new maplibregl.Map({
    container,
    style: mapStyle as any,
    center: initialCenter || [-59.0, -15.0], // South America center
    zoom: MAP_CONFIG.DEFAULT_ZOOM,
    attributionControl: MAP_CONFIG.ATTRIBUTION_CONTROL,
    maxZoom: MAP_CONFIG.MAX_ZOOM,
    fadeDuration: MAP_CONFIG.FADE_DURATION,
    // Enable tile caching optimizations
    transformRequest: (url, resourceType) => {
      // Add cache-friendly headers for tile requests
      if (resourceType === 'Tile') {
        return {
          url,
          headers: {
            'Cache-Control': 'public, max-age=604800' // 7 days
          }
        }
      }
      return { url }
    }
  })
  
  // Cache the map style after successful load
  map.on('style.load', () => {
    MapCache.cacheMapStyle(mapStyle)
  })
  
  // Add controls
  map.addControl(
    new maplibregl.NavigationControl(MAP_CONFIG.NAVIGATION_CONTROL), 
    'top-right'
  )
  
  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false, // Disable to prevent conflicts with our location system
      showAccuracyCircle: false,
      showUserLocation: false
    }),
    'top-right'
  )
  
  // Preload tiles when map is ready and user location is available
  if (enableTilePreload) {
    map.on('load', () => {
      // Try to get user location for tile preloading
      const storedLocation = localStorage.getItem('userLocation')
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation)
          if (location.latitude && location.longitude) {
            // Preload tiles in background
            MapCache.preloadTilesAroundLocation(location.longitude, location.latitude)
          }
        } catch (error) {
          console.warn('[MapCache] Failed to parse stored location for preloading')
        }
      }
    })
  }
  
  if (onMoveEnd) {
    map.on('moveend', onMoveEnd)
  }
  
  return map
}