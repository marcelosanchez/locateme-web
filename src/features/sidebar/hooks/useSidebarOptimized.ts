import { useEffect } from 'react'
import { useSessionStore } from '@/shared/state/sessionStore'
import { useSidebarState } from '@/features/sidebar/state/sidebarStore'
import { useAuthenticatedFetch } from '@/shared/hooks/useAuthenticatedFetch'
import { isSessionExpiredError } from '@/shared/errors/SessionExpiredError'
import { OPTIMIZED_API_ENDPOINTS, REFRESH_INTERVAL } from '@/config/constants'

interface DeviceName {
  device_id: string
  device_name: string
  device_icon: string
  device_type: string
  person_name: string
  is_primary: boolean
}

export function useSidebarOptimized() {
  const token = useSessionStore(state => state.token)
  const authenticatedFetch = useAuthenticatedFetch()

  const devices = useSidebarState(state => state.devices)
  const setDevices = useSidebarState(state => state.setDevices)
  const setLoading = useSidebarState(state => state.setLoading)
  const setError = useSidebarState(state => state.setError)
  
  const fetchDeviceNames = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      // Use optimized endpoint that returns ONLY names (no positions)
      const url = new URL(OPTIMIZED_API_ENDPOINTS.sidebarDeviceNames, import.meta.env.VITE_API_URL)
      const res = await authenticatedFetch(url.toString(), {
        method: 'GET',
      })

      if (!res.ok) throw new Error(`API response error: ${res.status}`)

      const response = await res.json()
      
      if (response.success && response.data) {
        // Convert to expected format (remove positions since sidebar doesn't need them)
        const deviceNames: DeviceName[] = response.data
        
        // Transform to match existing interface but without position data
        const transformedDevices = deviceNames.map(device => ({
          device_id: device.device_id,
          device_name: device.device_name,
          device_icon: device.device_icon,
          device_type: device.device_type,
          person_name: device.person_name,
          is_primary: device.is_primary,
          // No position data for optimized sidebar - provide empty strings to match interface
          latitude: '',
          longitude: '',
          readable_datetime: ''
        }))
        
        setDevices(transformedDevices)
      } else {
        throw new Error(response.error || 'Failed to fetch device names')
      }
    } catch (error) {
      // if session expired, useAuthenticatedFetch already redirected to login
      if (isSessionExpiredError(error)) {
          return // don't show error, already redirected
      }
      console.error('[useSidebarOptimized] Failed to fetch device names:', error)
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (!token || devices.length > 0) return
    fetchDeviceNames()
  }, [token, devices.length])

  // Periodic refresh every 5 minutes (names change rarely)
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      fetchDeviceNames()
    }, REFRESH_INTERVAL.sidebarNames)

    return () => clearInterval(interval)
  }, [token])

  return {
    devices,
    loading: useSidebarState(state => state.loading),
    error: useSidebarState(state => state.error),
    refreshDeviceNames: fetchDeviceNames
  }
}