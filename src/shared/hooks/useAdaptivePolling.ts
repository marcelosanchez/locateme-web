import { useEffect, useCallback } from 'react'
import { useSmartPolling } from './useSmartPolling'
import { usePageVisibility } from './usePageVisibility'
import { useOptimizedAppStore } from '../state/optimizedAppStore'

interface UseAdaptivePollingOptions {
  enabled?: boolean
  backgroundRefreshThreshold?: number // ms, refresh when returning from background after this time
  onError?: (error: Error) => void
}

/**
 * Adaptive polling hook that adjusts polling behavior based on:
 * - Page visibility (pause when hidden)
 * - Time in background (refresh when returning)
 * - Network connectivity
 * - Battery status (if available)
 */
export function useAdaptivePolling(options: UseAdaptivePollingOptions = {}) {
  const {
    enabled = true,
    backgroundRefreshThreshold = 30000, // 30 seconds
    onError
  } = options

  const { isVisible, timeInBackground } = usePageVisibility()
  const { setPollingEnabled } = useOptimizedAppStore()
  
  const {
    refreshAll,
    startPolling,
    stopPolling,
    isPolling,
    lastUpdates,
    refreshSidebarData,
    refreshMapData,
    refreshSelectedDevice
  } = useSmartPolling({
    enabled: enabled && isVisible,
    onError
  })

  // Handle page visibility changes
  useEffect(() => {
    if (!enabled) return

    if (isVisible) {
      // Page became visible
      setPollingEnabled(true)
      
      // If we were in background for too long, refresh immediately
      if (timeInBackground > backgroundRefreshThreshold) {
        console.log(`[useAdaptivePolling] Refreshing after ${timeInBackground}ms in background`)
        refreshAll()
      }
      
      startPolling()
    } else {
      // Page became hidden
      console.log('[useAdaptivePolling] Page hidden, pausing polling')
      setPollingEnabled(false)
      stopPolling()
    }
  }, [isVisible, timeInBackground, backgroundRefreshThreshold, enabled])

  // Network connectivity handling
  useEffect(() => {
    if (!enabled) return

    const handleOnline = () => {
      console.log('[useAdaptivePolling] Network reconnected, refreshing data')
      if (isVisible) {
        refreshAll()
        startPolling()
      }
    }

    const handleOffline = () => {
      console.log('[useAdaptivePolling] Network disconnected, stopping polling')
      stopPolling()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [enabled, isVisible, refreshAll, startPolling, stopPolling])

  // Battery optimization (experimental)
  useEffect(() => {
    if (!enabled || !('getBattery' in navigator)) return

    // @ts-ignore - Battery API is experimental
    navigator.getBattery?.()?.then((battery: any) => {
      const handleBatteryChange = () => {
        if (battery.level < 0.2 && !battery.charging) {
          console.log('[useAdaptivePolling] Low battery, reducing polling frequency')
          // Could implement reduced polling frequency here
        }
      }

      battery.addEventListener('levelchange', handleBatteryChange)
      battery.addEventListener('chargingchange', handleBatteryChange)

      return () => {
        battery.removeEventListener('levelchange', handleBatteryChange)
        battery.removeEventListener('chargingchange', handleBatteryChange)
      }
    })
  }, [enabled])

  // Smart refresh based on staleness
  const smartRefresh = useCallback(async (): Promise<void> => {
    const now = Date.now()
    const staleThreshold = 60000 // 1 minute

    const sidebarStale = !lastUpdates.sidebar || (now - lastUpdates.sidebar.getTime()) > staleThreshold
    const mapStale = !lastUpdates.map || (now - lastUpdates.map.getTime()) > staleThreshold
    const selectedDeviceStale = lastUpdates.selectedDevice && (now - lastUpdates.selectedDevice.getTime()) > staleThreshold

    const refreshPromises: Promise<void>[] = []

    if (sidebarStale) {
      refreshPromises.push(refreshSidebarData())
    }

    if (mapStale) {
      refreshPromises.push(refreshMapData())
    }

    if (selectedDeviceStale) {
      refreshPromises.push(refreshSelectedDevice())
    }

    await Promise.all(refreshPromises)
  }, [lastUpdates, refreshSidebarData, refreshMapData, refreshSelectedDevice])

  // Connection quality detection
  const getConnectionQuality = useCallback(() => {
    // @ts-ignore - Connection API is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (!connection) return 'unknown'

    if (connection.effectiveType) {
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'poor'
        case '3g':
          return 'moderate'
        case '4g':
          return 'good'
        default:
          return 'unknown'
      }
    }

    return 'unknown'
  }, [])

  return {
    // Status
    isPolling,
    isVisible,
    timeInBackground,
    connectionQuality: getConnectionQuality(),
    
    // Manual controls
    refreshAll,
    smartRefresh,
    startPolling,
    stopPolling,
    
    // Individual refresh
    refreshSidebarData,
    refreshMapData,
    refreshSelectedDevice,
    
    // State
    lastUpdates,
    
    // Network status
    isOnline: navigator.onLine
  }
}