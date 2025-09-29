import { useState, useEffect, useCallback } from 'react'
import { useSessionStore } from '@/shared/state/sessionStore'
import { useAuthenticatedFetch } from '@/shared/hooks/useAuthenticatedFetch'
import { isSessionExpiredError } from '@/shared/errors/SessionExpiredError'
import { OPTIMIZED_API_ENDPOINTS, REFRESH_INTERVAL } from '@/config/constants'

interface DeviceDetail {
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

interface UseSelectedDeviceOptimizedReturn {
  selectedDevice: DeviceDetail | null
  deviceRoute: DeviceRoute[]
  loading: boolean
  error: string | null
  selectDevice: (deviceId: string) => Promise<void>
  clearSelection: () => void
  refreshSelectedDevice: () => Promise<void>
  loadDeviceRoute: (hours?: number, limit?: number) => Promise<void>
  lastUpdate: Date | null
}

export function useSelectedDeviceOptimized(): UseSelectedDeviceOptimizedReturn {
  const [selectedDevice, setSelectedDevice] = useState<DeviceDetail | null>(null)
  const [deviceRoute, setDeviceRoute] = useState<DeviceRoute[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const token = useSessionStore(state => state.token)
  const authenticatedFetch = useAuthenticatedFetch()

  const selectDevice = useCallback(async (deviceId: string) => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      // Get real-time position for selected device
      const url = new URL(
        OPTIMIZED_API_ENDPOINTS.singleDevicePosition.replace(':deviceId', deviceId), 
        import.meta.env.VITE_API_URL
      )
      const res = await authenticatedFetch(url.toString(), {
        method: 'GET',
      })

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('You do not have access to this device')
        }
        throw new Error(`API response error: ${res.status}`)
      }

      const response = await res.json()
      
      if (response.success && response.data) {
        setSelectedDevice(response.data)
        setLastUpdate(new Date())
        
        // Also load device route
        await loadDeviceRoute(24, 100)
      } else {
        throw new Error(response.error || 'Failed to fetch device position')
      }
    } catch (error) {
      if (isSessionExpiredError(error)) {
          return
      }
      console.error('[useSelectedDeviceOptimized] Failed to select device:', error)
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [token, authenticatedFetch])

  const refreshSelectedDevice = useCallback(async () => {
    if (!selectedDevice?.device_id) return
    await selectDevice(selectedDevice.device_id)
  }, [selectedDevice?.device_id, selectDevice])

  const loadDeviceRoute = useCallback(async (hours: number = 24, limit: number = 100) => {
    if (!token || !selectedDevice?.device_id) return

    try {
      const url = new URL(
        OPTIMIZED_API_ENDPOINTS.deviceRoute.replace(':deviceId', selectedDevice.device_id), 
        import.meta.env.VITE_API_URL
      )
      url.searchParams.set('hours', hours.toString())
      url.searchParams.set('limit', limit.toString())

      const res = await authenticatedFetch(url.toString(), {
        method: 'GET',
      })

      if (!res.ok) throw new Error(`API response error: ${res.status}`)

      const response = await res.json()
      
      if (response.success && response.data) {
        setDeviceRoute(response.data)
      } else {
        console.warn('Failed to load device route:', response.error)
        setDeviceRoute([])
      }
    } catch (error) {
      if (isSessionExpiredError(error)) {
          return
      }
      console.error('[useSelectedDeviceOptimized] Failed to load route:', error)
      setDeviceRoute([])
    }
  }, [token, authenticatedFetch, selectedDevice?.device_id])

  const clearSelection = useCallback(() => {
    setSelectedDevice(null)
    setDeviceRoute([])
    setError(null)
  }, [])

  // Auto-refresh selected device every 15 seconds
  useEffect(() => {
    if (!selectedDevice?.device_id || !token) return

    const interval = setInterval(() => {
      refreshSelectedDevice()
    }, REFRESH_INTERVAL.selectedDevice)

    return () => clearInterval(interval)
  }, [selectedDevice?.device_id, token, refreshSelectedDevice])

  return {
    selectedDevice,
    deviceRoute,
    loading,
    error,
    selectDevice,
    clearSelection,
    refreshSelectedDevice,
    loadDeviceRoute,
    lastUpdate
  }
}