import { useEffect, useState } from 'react'
import type { DeviceBasic } from '@/types/device'
import type { DevicePosition } from '@/types/deviceSnapshot'
import { REFRESH_INTERVAL } from '@/config/constants'

type MergedDevice = DeviceBasic & Pick<DevicePosition, 'latitude' | 'longitude' | 'readable_datetime'>

export function useSidebarDevices(refreshMs = REFRESH_INTERVAL.normal): MergedDevice[] {
  const [devices, setDevices] = useState<MergedDevice[]>([])

  const fetchDevices = async () => {
    try {
      const url = new URL('/locateme/overview', import.meta.env.VITE_API_URL)
      const res = await fetch(url.toString(), { credentials: 'include' })

      if (!res.ok) {
        throw new Error(`API response error: ${res.status}`)
      }

      const data: MergedDevice[] = await res.json()
      setDevices(data)
    } catch (error) {
      console.error('[useSidebarDevices] Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchDevices()
    const interval = setInterval(fetchDevices, refreshMs)
    return () => clearInterval(interval)
  }, [refreshMs])

  return devices
}
