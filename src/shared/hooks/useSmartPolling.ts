import { useEffect, useRef, useCallback } from 'react'
import { useSessionStore } from '../state/sessionStore'
import { useOptimizedAppStore } from '../state/optimizedAppStore'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'
import { isSessionExpiredError } from '../errors/SessionExpiredError'
import { OPTIMIZED_API_ENDPOINTS, REFRESH_INTERVAL } from '@/config/constants'

interface UseSmartPollingOptions {
  enabled?: boolean
  onError?: (error: Error) => void
}

export function useSmartPolling(options: UseSmartPollingOptions = {}) {
  const { enabled = true, onError } = options
  
  const token = useSessionStore(state => state.token)
  const authenticatedFetch = useAuthenticatedFetch()
  
  // Store state and actions
  const {
    selectedDeviceId,
    pollingEnabled,
    setSidebarData,
    setMapData,
    setSelectedDevice,
    sidebarLastUpdate,
    mapLastUpdate,
    selectedDeviceLastUpdate
  } = useOptimizedAppStore()
  
  // Interval refs
  const sidebarIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mapIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const selectedDeviceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Fetch functions
  const fetchSidebarData = useCallback(async () => {
    if (!token) return
    
    try {
      setSidebarData([], true, null) // Set loading
      
      const url = new URL(OPTIMIZED_API_ENDPOINTS.sidebarDeviceNames, import.meta.env.VITE_API_URL)
      const res = await authenticatedFetch(url.toString())
      
      if (!res.ok) throw new Error(`API response error: ${res.status}`)
      
      const response = await res.json()
      
      if (response.success && response.data) {
        setSidebarData(response.data, false, null)
      } else {
        throw new Error(response.error || 'Failed to fetch device names')
      }
    } catch (error) {
      if (isSessionExpiredError(error)) return
      
      console.error('[useSmartPolling] Sidebar fetch failed:', error)
      setSidebarData([], false, (error as Error).message)
      onError?.(error as Error)
    }
  }, [token, authenticatedFetch, setSidebarData, onError])
  
  const fetchMapData = useCallback(async () => {
    if (!token) return
    
    try {
      setMapData([], true, null) // Set loading
      
      const url = new URL(OPTIMIZED_API_ENDPOINTS.mapDevicePositions, import.meta.env.VITE_API_URL)
      const res = await authenticatedFetch(url.toString())
      
      if (!res.ok) throw new Error(`API response error: ${res.status}`)
      
      const response = await res.json()
      
      if (response.success && response.data) {
        setMapData(response.data, false, null)
      } else {
        throw new Error(response.error || 'Failed to fetch device positions')
      }
    } catch (error) {
      if (isSessionExpiredError(error)) return
      
      console.error('[useSmartPolling] Map fetch failed:', error)
      setMapData([], false, (error as Error).message)
      onError?.(error as Error)
    }
  }, [token, authenticatedFetch, setMapData, onError])
  
  const fetchSelectedDeviceData = useCallback(async () => {
    if (!token || !selectedDeviceId) return
    
    try {
      setSelectedDevice(null, [], true, null) // Set loading
      
      // Get device position
      const deviceUrl = new URL(
        OPTIMIZED_API_ENDPOINTS.singleDevicePosition.replace(':deviceId', selectedDeviceId),
        import.meta.env.VITE_API_URL
      )
      const deviceRes = await authenticatedFetch(deviceUrl.toString())
      
      if (!deviceRes.ok) throw new Error(`Device API error: ${deviceRes.status}`)
      
      const deviceResponse = await deviceRes.json()
      
      if (!deviceResponse.success) {
        throw new Error(deviceResponse.error || 'Failed to fetch device position')
      }
      
      // Get device route
      const routeUrl = new URL(
        OPTIMIZED_API_ENDPOINTS.deviceRoute.replace(':deviceId', selectedDeviceId),
        import.meta.env.VITE_API_URL
      )
      routeUrl.searchParams.set('hours', '24')
      routeUrl.searchParams.set('limit', '100')
      
      const routeRes = await authenticatedFetch(routeUrl.toString())
      let routeData = []
      
      if (routeRes.ok) {
        const routeResponse = await routeRes.json()
        if (routeResponse.success && routeResponse.data) {
          routeData = routeResponse.data
        }
      }
      
      setSelectedDevice(deviceResponse.data, routeData, false, null)
    } catch (error) {
      if (isSessionExpiredError(error)) return
      
      console.error('[useSmartPolling] Selected device fetch failed:', error)
      setSelectedDevice(null, [], false, (error as Error).message)
      onError?.(error as Error)
    }
  }, [token, selectedDeviceId, authenticatedFetch, setSelectedDevice, onError])
  
  // Start/stop polling functions
  const startSidebarPolling = useCallback(() => {
    if (sidebarIntervalRef.current) return
    
    // Initial fetch
    fetchSidebarData()
    
    // Set up interval
    sidebarIntervalRef.current = setInterval(
      fetchSidebarData,
      REFRESH_INTERVAL.sidebarNames
    )
  }, [fetchSidebarData])
  
  const startMapPolling = useCallback(() => {
    if (mapIntervalRef.current) return
    
    // Initial fetch
    fetchMapData()
    
    // Set up interval
    mapIntervalRef.current = setInterval(
      fetchMapData,
      REFRESH_INTERVAL.otherDevices
    )
  }, [fetchMapData])
  
  const startSelectedDevicePolling = useCallback(() => {
    if (selectedDeviceIntervalRef.current || !selectedDeviceId) return
    
    // Initial fetch
    fetchSelectedDeviceData()
    
    // Set up interval
    selectedDeviceIntervalRef.current = setInterval(
      fetchSelectedDeviceData,
      REFRESH_INTERVAL.selectedDevice
    )
  }, [fetchSelectedDeviceData, selectedDeviceId])
  
  const stopSidebarPolling = useCallback(() => {
    if (sidebarIntervalRef.current) {
      clearInterval(sidebarIntervalRef.current)
      sidebarIntervalRef.current = null
    }
  }, [])
  
  const stopMapPolling = useCallback(() => {
    if (mapIntervalRef.current) {
      clearInterval(mapIntervalRef.current)
      mapIntervalRef.current = null
    }
  }, [])
  
  const stopSelectedDevicePolling = useCallback(() => {
    if (selectedDeviceIntervalRef.current) {
      clearInterval(selectedDeviceIntervalRef.current)
      selectedDeviceIntervalRef.current = null
    }
  }, [])
  
  // Main polling control effect
  useEffect(() => {
    if (!enabled || !pollingEnabled || !token) {
      stopSidebarPolling()
      stopMapPolling()
      stopSelectedDevicePolling()
      return
    }
    
    startSidebarPolling()
    startMapPolling()
    
    if (selectedDeviceId) {
      startSelectedDevicePolling()
    } else {
      stopSelectedDevicePolling()
    }
    
    return () => {
      stopSidebarPolling()
      stopMapPolling()
      stopSelectedDevicePolling()
    }
  }, [enabled, pollingEnabled, token, selectedDeviceId])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSidebarPolling()
      stopMapPolling()
      stopSelectedDevicePolling()
    }
  }, [])
  
  // Manual refresh functions
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchSidebarData(),
      fetchMapData(),
      selectedDeviceId ? fetchSelectedDeviceData() : Promise.resolve()
    ])
  }, [fetchSidebarData, fetchMapData, fetchSelectedDeviceData, selectedDeviceId])
  
  return {
    // Manual refresh functions
    refreshSidebarData: fetchSidebarData,
    refreshMapData: fetchMapData,
    refreshSelectedDevice: fetchSelectedDeviceData,
    refreshAll,
    
    // Polling control
    startPolling: () => {
      startSidebarPolling()
      startMapPolling()
      if (selectedDeviceId) startSelectedDevicePolling()
    },
    stopPolling: () => {
      stopSidebarPolling()
      stopMapPolling()
      stopSelectedDevicePolling()
    },
    
    // Status
    isPolling: {
      sidebar: !!sidebarIntervalRef.current,
      map: !!mapIntervalRef.current,
      selectedDevice: !!selectedDeviceIntervalRef.current
    },
    
    // Last update times
    lastUpdates: {
      sidebar: sidebarLastUpdate,
      map: mapLastUpdate,
      selectedDevice: selectedDeviceLastUpdate
    }
  }
}