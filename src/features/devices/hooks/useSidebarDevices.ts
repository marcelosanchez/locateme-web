import { useEffect } from 'react'
import { useSessionStore } from '@/shared/state/sessionStore'
import { useSidebarState } from '@/features/sidebar/state/sidebarStore'
import type { DeviceBasic } from '@/types/device'
import type { DevicePosition } from '@/types/deviceSnapshot'

type MergedDevice = DeviceBasic & Pick<DevicePosition, 'latitude' | 'longitude' | 'readable_datetime'>

export function useSidebarDevices(): MergedDevice[] {
  const token = useSessionStore(state => state.token)

  const devices = useSidebarState(state => state.devices)
  const setDevices = useSidebarState(state => state.setDevices)
  const setLoading = useSidebarState(state => state.setLoading)
  const setError = useSidebarState(state => state.setError)
  useEffect(() => {
    if (!token || devices.length > 0) return

    const fetchDevices = async () => {
      setLoading(true)
      setError(null)

      try {
        const url = new URL('/locateme/sidebar/devices', import.meta.env.VITE_API_URL)
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error(`API response error: ${res.status}`)

        const data: MergedDevice[] = await res.json()
        setDevices(data)
      } catch (error) {
        console.error('[useSidebarDevices] Failed to fetch sidebar data:', error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [token, devices.length, setDevices, setLoading, setError])

  return devices
}
