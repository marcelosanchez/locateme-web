import { useState, useEffect, useCallback } from 'react'
import { MapCache } from '@/config/map.config'
import { UserLocation } from './useUserLocationOptimized'

interface MapCacheStats {
  tileCount: number
  estimatedSize: string
  isSupported: boolean
}

interface UseMapCacheReturn {
  stats: MapCacheStats
  refreshStats: () => Promise<void>
  preloadUserArea: (location: UserLocation) => Promise<void>
  clearCache: () => Promise<void>
  isLoading: boolean
}

export function useMapCache(): UseMapCacheReturn {
  const [stats, setStats] = useState<MapCacheStats>({
    tileCount: 0,
    estimatedSize: '0 MB',
    isSupported: 'caches' in window
  })
  const [isLoading, setIsLoading] = useState(false)

  // Refresh cache statistics
  const refreshStats = useCallback(async () => {
    try {
      const cacheStats = await MapCache.getCacheStats()
      setStats(prev => ({
        ...prev,
        ...cacheStats
      }))
    } catch (error) {
      console.warn('[useMapCache] Failed to refresh stats:', error)
    }
  }, [])

  // Preload tiles around user location
  const preloadUserArea = useCallback(async (location: UserLocation) => {
    setIsLoading(true)
    try {
      await MapCache.preloadTilesAroundLocation(location.longitude, location.latitude)
      await refreshStats() // Update stats after preloading
    } catch (error) {
      console.warn('[useMapCache] Failed to preload user area:', error)
    } finally {
      setIsLoading(false)
    }
  }, [refreshStats])

  // Clear all cached tiles
  const clearCache = useCallback(async () => {
    setIsLoading(true)
    try {
      if ('caches' in window) {
        await caches.delete('map-tiles-v1')
        // Also clear cached map style
        localStorage.removeItem('locateme_map_style')
      }
      await refreshStats()
    } catch (error) {
      console.warn('[useMapCache] Failed to clear cache:', error)
    } finally {
      setIsLoading(false)
    }
  }, [refreshStats])

  // Load initial stats
  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  return {
    stats,
    refreshStats,
    preloadUserArea,
    clearCache,
    isLoading
  }
}