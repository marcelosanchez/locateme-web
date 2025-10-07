import { useEffect, useCallback } from 'react'
import { useUserLocationOptimized } from './useUserLocationOptimized'
import { useMapPositionsOptimized } from './useMapPositionsOptimized'
import { useSelectedDeviceOptimized } from '@/features/devices/hooks/useSelectedDeviceOptimized'
import { useMapStore } from '../state/mapStore'

interface UseMapOptimizedReturn {
  // User location
  userLocation: ReturnType<typeof useUserLocationOptimized>['userLocation']
  requestUserLocation: () => Promise<ReturnType<typeof useUserLocationOptimized>['userLocation']>
  
  // All device positions for map
  allPositions: ReturnType<typeof useMapPositionsOptimized>['positions']
  refreshAllPositions: () => Promise<void>
  positionsLoading: boolean
  positionsError: string | null
  
  // Selected device
  selectedDevice: ReturnType<typeof useSelectedDeviceOptimized>['selectedDevice']
  deviceRoute: ReturnType<typeof useSelectedDeviceOptimized>['deviceRoute']
  selectDevice: (deviceId: string) => Promise<void>
  clearDeviceSelection: () => void
  
  // Map centering
  centerOnUser: () => Promise<void>
  centerOnDevice: (deviceId: string) => Promise<void>
  
  // Overall state
  isLoading: boolean
  hasErrors: boolean
}

export function useMapOptimized(): UseMapOptimizedReturn {
  // Individual hooks
  const userLocation = useUserLocationOptimized()
  const mapPositions = useMapPositionsOptimized()
  const selectedDevice = useSelectedDeviceOptimized()
  
  // Map store for centering
  const setCenter = useMapStore(state => state.setCenter)
  const map = useMapStore(state => state.map)

  // Center map on user location
  const centerOnUser = useCallback(async () => {
    if (userLocation.userLocation) {
      const center: [number, number] = [
        userLocation.userLocation.longitude,
        userLocation.userLocation.latitude
      ]
      setCenter(center)
      map?.flyTo({ center, zoom: 16 })
    } else {
      // Request location if not available
      await userLocation.requestLocation()
      const location: any = userLocation.userLocation
      if (location) {
        const center: [number, number] = [
          location.longitude,
          location.latitude
        ]
        setCenter(center)
        map?.flyTo({ center, zoom: 16 })
      }
    }
  }, [userLocation.userLocation, userLocation.requestLocation, setCenter, map])

  // Center map on specific device
  const centerOnDevice = useCallback(async (deviceId: string) => {
    // First select the device to get fresh position
    await selectedDevice.selectDevice(deviceId)
    
    // Then center on it
    const device = selectedDevice.selectedDevice
    if (device && device.latitude && device.longitude) {
      const center: [number, number] = [
        parseFloat(device.longitude),
        parseFloat(device.latitude)
      ]
      setCenter(center)
      map?.flyTo({ center, zoom: 17 })
    }
  }, [selectedDevice.selectDevice, selectedDevice.selectedDevice, setCenter, map])

  // Auto-center on user location when map loads (if no selected device)
  // DISABLED: This was causing conflicts with device tracking on iPhone
  // iPhone updates userLocation frequently, causing unwanted auto-centering during tracking
  // useEffect(() => {
  //   if (!selectedDevice.selectedDevice && userLocation.userLocation && map) {
  //     centerOnUser()
  //   }
  // }, [userLocation.userLocation, selectedDevice.selectedDevice, map])

  // Auto-center on selected device when it changes
  useEffect(() => {
    const device = selectedDevice.selectedDevice
    if (device && device.latitude && device.longitude && map) {
      const center: [number, number] = [
        parseFloat(device.longitude),
        parseFloat(device.latitude)
      ]
      setCenter(center)
      map?.flyTo({ center, zoom: 17 })
    }
  }, [selectedDevice.selectedDevice, setCenter, map])

  // Computed states
  const isLoading = userLocation.isLoading || mapPositions.loading || selectedDevice.loading
  const hasErrors = !!(userLocation.error || mapPositions.error || selectedDevice.error)

  return {
    // User location
    userLocation: userLocation.userLocation,
    requestUserLocation: userLocation.requestLocation,
    
    // All device positions
    allPositions: mapPositions.positions,
    refreshAllPositions: mapPositions.refreshPositions,
    positionsLoading: mapPositions.loading,
    positionsError: mapPositions.error,
    
    // Selected device
    selectedDevice: selectedDevice.selectedDevice,
    deviceRoute: selectedDevice.deviceRoute,
    selectDevice: selectedDevice.selectDevice,
    clearDeviceSelection: selectedDevice.clearSelection,
    
    // Map centering
    centerOnUser,
    centerOnDevice,
    
    // Overall state
    isLoading,
    hasErrors
  }
}