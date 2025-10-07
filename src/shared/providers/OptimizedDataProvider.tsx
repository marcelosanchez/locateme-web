import React, { createContext, useContext, useEffect } from 'react'
import { useAdaptivePolling } from '../hooks/useAdaptivePolling'
import { useOptimizedAppStore } from '../state/optimizedAppStore'
import { useSessionStore } from '../state/sessionStore'

interface OptimizedDataContextValue {
  // Polling control
  refreshAll: () => Promise<void>
  smartRefresh: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
  
  // Individual refresh
  refreshSidebarData: () => Promise<void>
  refreshMapData: () => Promise<void>
  refreshSelectedDevice: () => Promise<void>
  
  // Status
  isPolling: {
    sidebar: boolean
    map: boolean
    selectedDevice: boolean
  }
  isOnline: boolean
  isVisible: boolean
  
  // Data access helpers
  getDevicePosition: (deviceId: string) => any
  selectDevice: (deviceId: string | null) => void
  clearErrors: () => void
}

const OptimizedDataContext = createContext<OptimizedDataContextValue | null>(null)

interface OptimizedDataProviderProps {
  children: React.ReactNode
  enabled?: boolean
}

export function OptimizedDataProvider({ children, enabled = true }: OptimizedDataProviderProps) {
  const token = useSessionStore(state => state.token)
  
  const {
    getDevicePosition,
    selectDevice,
    clearErrors
  } = useOptimizedAppStore()
  
  const {
    refreshAll,
    smartRefresh,
    startPolling,
    stopPolling,
    refreshSidebarData,
    refreshMapData,
    refreshSelectedDevice,
    isPolling,
    isOnline,
    isVisible
  } = useAdaptivePolling({
    enabled: enabled && !!token,
    backgroundRefreshThreshold: 30000, // 30 seconds
    onError: (error) => {
      console.error('[OptimizedDataProvider] Polling error:', error)
      // Could add toast notification here
    }
  })

  // Auto-start polling when token is available
  useEffect(() => {
    if (token && enabled) {
      startPolling()
    } else {
      stopPolling()
    }
  }, [token, enabled, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  const contextValue: OptimizedDataContextValue = {
    // Polling control
    refreshAll,
    smartRefresh,
    startPolling,
    stopPolling,
    
    // Individual refresh
    refreshSidebarData,
    refreshMapData,
    refreshSelectedDevice,
    
    // Status
    isPolling,
    isOnline,
    isVisible,
    
    // Data access helpers
    getDevicePosition,
    selectDevice,
    clearErrors
  }

  return (
    <OptimizedDataContext.Provider value={contextValue}>
      {children}
    </OptimizedDataContext.Provider>
  )
}

export function useOptimizedData(): OptimizedDataContextValue {
  const context = useContext(OptimizedDataContext)
  
  if (!context) {
    throw new Error('useOptimizedData must be used within OptimizedDataProvider')
  }
  
  return context
}

// Convenience hooks for specific data
export function useSidebarData() {
  const { deviceNames, sidebarLoading, sidebarError } = useOptimizedAppStore()
  const { refreshSidebarData } = useOptimizedData()
  
  return {
    devices: deviceNames,
    loading: sidebarLoading,
    error: sidebarError,
    refresh: refreshSidebarData
  }
}

export function useMapData() {
  const { devicePositions, mapLoading, mapError } = useOptimizedAppStore()
  const { refreshMapData } = useOptimizedData()
  
  return {
    positions: Object.values(devicePositions),
    positionsMap: devicePositions,
    loading: mapLoading,
    error: mapError,
    refresh: refreshMapData
  }
}

export function useSelectedDeviceData() {
  const {
    selectedDevice,
    deviceRoute,
    selectedDeviceLoading,
    selectedDeviceError,
    selectedDeviceId
  } = useOptimizedAppStore()
  const { refreshSelectedDevice, selectDevice } = useOptimizedData()
  
  return {
    device: selectedDevice,
    route: deviceRoute,
    loading: selectedDeviceLoading,
    error: selectedDeviceError,
    deviceId: selectedDeviceId,
    refresh: refreshSelectedDevice,
    select: selectDevice,
    clear: () => selectDevice(null)
  }
}