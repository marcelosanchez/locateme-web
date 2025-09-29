import { useState, useEffect, useCallback } from 'react'
import { useOptimizedAppStore } from '../state/optimizedAppStore'

interface PerformanceMetrics {
  // Response times
  sidebarResponseTime: number | null
  mapResponseTime: number | null
  selectedDeviceResponseTime: number | null
  
  // Memory usage
  memoryUsage: number | null
  memoryLimit: number | null
  
  // Network performance
  networkDownlink: number | null
  networkRTT: number | null
  networkEffectiveType: string | null
  
  // Battery status
  batteryLevel: number | null
  batteryCharging: boolean | null
  
  // Refresh frequencies
  sidebarRefreshRate: number // requests per minute
  mapRefreshRate: number
  selectedDeviceRefreshRate: number
  
  // Error rates
  sidebarErrorRate: number
  mapErrorRate: number
  selectedDeviceErrorRate: number
  
  // Cache hit rates
  cacheHitRate: number
}

interface PerformanceStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastError: string | null
  lastErrorTime: Date | null
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    sidebarResponseTime: null,
    mapResponseTime: null,
    selectedDeviceResponseTime: null,
    memoryUsage: null,
    memoryLimit: null,
    networkDownlink: null,
    networkRTT: null,
    networkEffectiveType: null,
    batteryLevel: null,
    batteryCharging: null,
    sidebarRefreshRate: 0,
    mapRefreshRate: 0,
    selectedDeviceRefreshRate: 0,
    sidebarErrorRate: 0,
    mapErrorRate: 0,
    selectedDeviceErrorRate: 0,
    cacheHitRate: 0
  })

  const [stats, setStats] = useState<{
    sidebar: PerformanceStats
    map: PerformanceStats
    selectedDevice: PerformanceStats
  }>({
    sidebar: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, averageResponseTime: 0, lastError: null, lastErrorTime: null },
    map: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, averageResponseTime: 0, lastError: null, lastErrorTime: null },
    selectedDevice: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, averageResponseTime: 0, lastError: null, lastErrorTime: null }
  })

  const {
    sidebarLastUpdate,
    mapLastUpdate,
    selectedDeviceLastUpdate,
    sidebarError,
    mapError,
    selectedDeviceError
  } = useOptimizedAppStore()

  // Memory monitoring
  const updateMemoryMetrics = useCallback(() => {
    if ('memory' in performance) {
      // @ts-ignore - Memory API is experimental
      const memory = performance.memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize,
        memoryLimit: memory.jsHeapSizeLimit
      }))
    }
  }, [])

  // Network monitoring
  const updateNetworkMetrics = useCallback(() => {
    // @ts-ignore - Connection API is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      setMetrics(prev => ({
        ...prev,
        networkDownlink: connection.downlink || null,
        networkRTT: connection.rtt || null,
        networkEffectiveType: connection.effectiveType || null
      }))
    }
  }, [])

  // Battery monitoring
  const updateBatteryMetrics = useCallback(() => {
    if ('getBattery' in navigator) {
      // @ts-ignore - Battery API is experimental
      navigator.getBattery?.()?.then((battery: any) => {
        setMetrics(prev => ({
          ...prev,
          batteryLevel: battery.level,
          batteryCharging: battery.charging
        }))
      })
    }
  }, [])

  // Response time monitoring
  const trackResponseTime = useCallback((endpoint: 'sidebar' | 'map' | 'selectedDevice', responseTime: number, success: boolean) => {
    setStats(prev => {
      const endpointStats = prev[endpoint]
      const newTotalRequests = endpointStats.totalRequests + 1
      const newSuccessfulRequests = success ? endpointStats.successfulRequests + 1 : endpointStats.successfulRequests
      const newFailedRequests = success ? endpointStats.failedRequests : endpointStats.failedRequests + 1
      
      // Calculate new average response time
      const newAverageResponseTime = success 
        ? (endpointStats.averageResponseTime * endpointStats.successfulRequests + responseTime) / newSuccessfulRequests
        : endpointStats.averageResponseTime

      return {
        ...prev,
        [endpoint]: {
          totalRequests: newTotalRequests,
          successfulRequests: newSuccessfulRequests,
          failedRequests: newFailedRequests,
          averageResponseTime: newAverageResponseTime,
          lastError: success ? endpointStats.lastError : 'Request failed',
          lastErrorTime: success ? endpointStats.lastErrorTime : new Date()
        }
      }
    })

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      [`${endpoint}ResponseTime`]: responseTime,
      [`${endpoint}ErrorRate`]: (stats[endpoint].failedRequests / stats[endpoint].totalRequests) * 100
    }))
  }, [stats])

  // Calculate refresh rates
  useEffect(() => {
    const calculateRefreshRates = () => {
      const now = Date.now()
      const oneMinute = 60000

      // Calculate based on update frequencies
      const sidebarRate = sidebarLastUpdate ? (oneMinute / (300000)) : 0 // 5 min interval = 0.2/min
      const mapRate = mapLastUpdate ? (oneMinute / (45000)) : 0 // 45s interval = 1.33/min  
      const selectedDeviceRate = selectedDeviceLastUpdate ? (oneMinute / (15000)) : 0 // 15s interval = 4/min

      setMetrics(prev => ({
        ...prev,
        sidebarRefreshRate: sidebarRate,
        mapRefreshRate: mapRate,
        selectedDeviceRefreshRate: selectedDeviceRate
      }))
    }

    const interval = setInterval(calculateRefreshRates, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [sidebarLastUpdate, mapLastUpdate, selectedDeviceLastUpdate])

  // Monitor errors
  useEffect(() => {
    if (sidebarError) {
      trackResponseTime('sidebar', 0, false)
    }
  }, [sidebarError, trackResponseTime])

  useEffect(() => {
    if (mapError) {
      trackResponseTime('map', 0, false)
    }
  }, [mapError, trackResponseTime])

  useEffect(() => {
    if (selectedDeviceError) {
      trackResponseTime('selectedDevice', 0, false)
    }
  }, [selectedDeviceError, trackResponseTime])

  // Periodic metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      updateMemoryMetrics()
      updateNetworkMetrics()
      updateBatteryMetrics()
    }, 5000) // Update every 5 seconds

    // Initial update
    updateMemoryMetrics()
    updateNetworkMetrics()
    updateBatteryMetrics()

    return () => clearInterval(interval)
  }, [updateMemoryMetrics, updateNetworkMetrics, updateBatteryMetrics])

  // Performance optimization recommendations
  const getRecommendations = useCallback(() => {
    const recommendations = []

    if (metrics.memoryUsage && metrics.memoryLimit && (metrics.memoryUsage / metrics.memoryLimit) > 0.8) {
      recommendations.push('High memory usage detected. Consider reducing polling frequency.')
    }

    if (metrics.batteryLevel && metrics.batteryLevel < 0.2 && !metrics.batteryCharging) {
      recommendations.push('Low battery detected. Reducing update frequency to save power.')
    }

    if (metrics.networkEffectiveType === 'slow-2g' || metrics.networkEffectiveType === '2g') {
      recommendations.push('Slow network detected. Consider reducing data transfer.')
    }

    if (metrics.sidebarErrorRate > 10 || metrics.mapErrorRate > 10 || metrics.selectedDeviceErrorRate > 10) {
      recommendations.push('High error rate detected. Check network connectivity.')
    }

    return recommendations
  }, [metrics])

  // Export performance data
  const exportMetrics = useCallback(() => {
    return {
      metrics,
      stats,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }, [metrics, stats])

  return {
    metrics,
    stats,
    trackResponseTime,
    getRecommendations: getRecommendations(),
    exportMetrics,
    
    // Quick access to key metrics
    isPerformanceGood: metrics.sidebarErrorRate < 5 && metrics.mapErrorRate < 5 && 
                      (metrics.memoryUsage ? (metrics.memoryUsage / (metrics.memoryLimit || 1)) < 0.7 : true),
    
    averageResponseTimes: {
      sidebar: stats.sidebar.averageResponseTime,
      map: stats.map.averageResponseTime,
      selectedDevice: stats.selectedDevice.averageResponseTime
    },
    
    errorRates: {
      sidebar: metrics.sidebarErrorRate,
      map: metrics.mapErrorRate,
      selectedDevice: metrics.selectedDeviceErrorRate
    }
  }
}