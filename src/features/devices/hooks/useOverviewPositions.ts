import { useEffect, useState } from 'react'
import type { DevicePosition } from '@/types/deviceSnapshot'
import { REFRESH_INTERVAL } from '@/config/constants'

export function useOverviewPositions(refreshMs = REFRESH_INTERVAL.normal): DevicePosition[] {
  const [positions, setPositions] = useState<DevicePosition[]>([])

  const fetchPositions = async () => {
    try {
      const url = new URL('/locateme/overview', import.meta.env.VITE_API_URL)
      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      setPositions(data)
    } catch (err) {
      console.error('[useOverviewPositions] Failed to fetch positions:', err)
    }
  }

  useEffect(() => {
    fetchPositions()
    const interval = setInterval(fetchPositions, refreshMs)
    return () => clearInterval(interval)
  }, [refreshMs])

  return positions
}
