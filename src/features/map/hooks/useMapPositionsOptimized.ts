import { useState, useEffect, useCallback } from 'react'
import { useSessionStore } from '@/shared/state/sessionStore'
import { useAuthenticatedFetch } from '@/shared/hooks/useAuthenticatedFetch'
import { isSessionExpiredError } from '@/shared/errors/SessionExpiredError'
import { OPTIMIZED_API_ENDPOINTS, REFRESH_INTERVAL } from '@/config/constants'

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

interface UseMapPositionsOptimizedReturn {
  positions: DevicePosition[]
  loading: boolean
  error: string | null
  refreshPositions: () => Promise<void>
  lastUpdate: Date | null
}

export function useMapPositionsOptimized(): UseMapPositionsOptimizedReturn {
  const [positions, setPositions] = useState<DevicePosition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const token = useSessionStore(state => state.token)
  const authenticatedFetch = useAuthenticatedFetch()

  const refreshPositions = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      // Use optimized endpoint that returns ALL positions for map
      const url = new URL(OPTIMIZED_API_ENDPOINTS.mapDevicePositions, import.meta.env.VITE_API_URL)
      const res = await authenticatedFetch(url.toString(), {
        method: 'GET',
      })

      if (!res.ok) throw new Error(`API response error: ${res.status}`)

      const response = await res.json()
      
      if (response.success && response.data) {
        setPositions(response.data)
        setLastUpdate(new Date())
      } else {
        throw new Error(response.error || 'Failed to fetch device positions')
      }
    } catch (error) {
      // if session expired, useAuthenticatedFetch already redirected to login
      if (isSessionExpiredError(error)) {
          return // don't show error, already redirected
      }
      console.error('[useMapPositionsOptimized] Failed to fetch positions:', error)
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [token, authenticatedFetch])

  // Initial fetch
  useEffect(() => {
    if (!token) return
    refreshPositions()
  }, [token, refreshPositions])

  // Periodic refresh every 30 seconds for map positions
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      refreshPositions()
    }, REFRESH_INTERVAL.mapInitial)

    return () => clearInterval(interval)
  }, [token, refreshPositions])

  return {
    positions,
    loading,
    error,
    refreshPositions,
    lastUpdate
  }
}