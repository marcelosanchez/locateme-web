import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Interfaces
interface DeviceName {
  device_id: string
  device_name: string
  device_icon: string
  device_type: string
  person_name: string
  is_primary: boolean
}

interface DevicePosition {
  device_id: string
  device_name: string
  device_icon: string
  device_type: string
  latitude: string | null
  longitude: string | null
  readable_datetime: string | null
  battery_level: number | null
  battery_status: string | null
  person_name: string | null
  is_primary: boolean
}

interface DeviceDetail extends DevicePosition {
  timestamp?: number
  horizontal_accuracy?: number
  altitude?: number
  person_picture?: string | null
}

interface DeviceRoute {
  latitude: string
  longitude: string
  readable_datetime: string
  timestamp: number
  horizontal_accuracy?: number
  battery_level?: number | null
}

interface UserLocation {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

// State interface
interface OptimizedAppState {
  // Sidebar data (names only, minimal data)
  deviceNames: DeviceName[]
  sidebarLoading: boolean
  sidebarError: string | null
  sidebarLastUpdate: Date | null
  
  // Map data (all positions)
  devicePositions: Record<string, DevicePosition>
  mapLoading: boolean
  mapError: string | null
  mapLastUpdate: Date | null
  
  // Selected device (real-time data)
  selectedDevice: DeviceDetail | null
  deviceRoute: DeviceRoute[]
  selectedDeviceLoading: boolean
  selectedDeviceError: string | null
  selectedDeviceLastUpdate: Date | null
  
  // User location
  userLocation: UserLocation | null
  userLocationLoading: boolean
  userLocationError: string | null
  
  // UI State
  selectedDeviceId: string | null
  mapCenter: [number, number] | null
  
  // Polling control
  pollingEnabled: boolean
  sidebarPollingInterval: number | null
  mapPollingInterval: number | null
  selectedDevicePollingInterval: number | null
  
  // Actions
  setSidebarData: (devices: DeviceName[], loading?: boolean, error?: string | null) => void
  setMapData: (positions: DevicePosition[], loading?: boolean, error?: string | null) => void
  setSelectedDevice: (device: DeviceDetail | null, route?: DeviceRoute[], loading?: boolean, error?: string | null) => void
  setUserLocation: (location: UserLocation | null, loading?: boolean, error?: string | null) => void
  selectDevice: (deviceId: string | null) => void
  setMapCenter: (center: [number, number] | null) => void
  
  // Polling control
  setPollingEnabled: (enabled: boolean) => void
  setSidebarPollingInterval: (interval: number | null) => void
  setMapPollingInterval: (interval: number | null) => void
  setSelectedDevicePollingInterval: (interval: number | null) => void
  
  // Utility actions
  clearErrors: () => void
  resetSelectedDevice: () => void
  getDevicePosition: (deviceId: string) => DevicePosition | null
}

export const useOptimizedAppStore = create<OptimizedAppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      deviceNames: [],
      sidebarLoading: false,
      sidebarError: null,
      sidebarLastUpdate: null,
      
      devicePositions: {},
      mapLoading: false,
      mapError: null,
      mapLastUpdate: null,
      
      selectedDevice: null,
      deviceRoute: [],
      selectedDeviceLoading: false,
      selectedDeviceError: null,
      selectedDeviceLastUpdate: null,
      
      userLocation: null,
      userLocationLoading: false,
      userLocationError: null,
      
      selectedDeviceId: null,
      mapCenter: null,
      
      pollingEnabled: true,
      sidebarPollingInterval: null,
      mapPollingInterval: null,
      selectedDevicePollingInterval: null,
      
      // Actions
      setSidebarData: (devices, loading = false, error = null) =>
        set(
          {
            deviceNames: devices,
            sidebarLoading: loading,
            sidebarError: error,
            sidebarLastUpdate: new Date()
          },
          false,
          'setSidebarData'
        ),
      
      setMapData: (positions, loading = false, error = null) =>
        set(
          {
            devicePositions: positions.reduce((acc, pos) => {
              acc[pos.device_id] = pos
              return acc
            }, {} as Record<string, DevicePosition>),
            mapLoading: loading,
            mapError: error,
            mapLastUpdate: new Date()
          },
          false,
          'setMapData'
        ),
      
      setSelectedDevice: (device, route = [], loading = false, error = null) =>
        set(
          {
            selectedDevice: device,
            deviceRoute: route,
            selectedDeviceLoading: loading,
            selectedDeviceError: error,
            selectedDeviceLastUpdate: device ? new Date() : null,
            selectedDeviceId: device?.device_id || null
          },
          false,
          'setSelectedDevice'
        ),
      
      setUserLocation: (location, loading = false, error = null) =>
        set(
          {
            userLocation: location,
            userLocationLoading: loading,
            userLocationError: error
          },
          false,
          'setUserLocation'
        ),
      
      selectDevice: (deviceId) =>
        set(
          { selectedDeviceId: deviceId },
          false,
          'selectDevice'
        ),
      
      setMapCenter: (center) =>
        set(
          { mapCenter: center },
          false,
          'setMapCenter'
        ),
      
      // Polling control
      setPollingEnabled: (enabled) =>
        set(
          { pollingEnabled: enabled },
          false,
          'setPollingEnabled'
        ),
      
      setSidebarPollingInterval: (interval) =>
        set(
          { sidebarPollingInterval: interval },
          false,
          'setSidebarPollingInterval'
        ),
      
      setMapPollingInterval: (interval) =>
        set(
          { mapPollingInterval: interval },
          false,
          'setMapPollingInterval'
        ),
      
      setSelectedDevicePollingInterval: (interval) =>
        set(
          { selectedDevicePollingInterval: interval },
          false,
          'setSelectedDevicePollingInterval'
        ),
      
      // Utility actions
      clearErrors: () =>
        set(
          {
            sidebarError: null,
            mapError: null,
            selectedDeviceError: null,
            userLocationError: null
          },
          false,
          'clearErrors'
        ),
      
      resetSelectedDevice: () =>
        set(
          {
            selectedDevice: null,
            deviceRoute: [],
            selectedDeviceId: null,
            selectedDeviceError: null,
            selectedDeviceLastUpdate: null
          },
          false,
          'resetSelectedDevice'
        ),
      
      getDevicePosition: (deviceId) => {
        const state = get()
        return state.devicePositions[deviceId] || null
      }
    }),
    {
      name: 'optimized-app-store',
      // Only log important actions in production
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)