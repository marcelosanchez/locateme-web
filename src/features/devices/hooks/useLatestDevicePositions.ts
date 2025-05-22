import { useEffect, useState } from 'react'
import type { DevicePosition } from '@/types/deviceSnapshot'
import { REFRESH_INTERVAL } from '@/config/constants'

export function useLatestDevicePositions(refreshMs = REFRESH_INTERVAL.normal): DevicePosition[] {
  const [positions, setPositions] = useState<DevicePosition[]>([])

  const fetchPositions = async (): Promise<void> => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/locateme/position`
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`)
      }

      const data: DevicePosition[] = await res.json()
      setPositions(data)
    } catch (err) {
      console.error('[useLatestDevicePositions] Failed to fetch positions:', err)
    }
  }

  useEffect(() => {
    fetchPositions()
    const interval = setInterval(fetchPositions, refreshMs)
    return () => clearInterval(interval)
  }, [refreshMs])

  return positions
}
