import { useEffect, useState, useCallback } from 'react'
import type { DevicePosition } from '@/types/deviceSnapshot'
import { MAP_REFRESH_INTERVAL_MS } from '@/config/constants'
import { useSessionStore } from '@/shared/state/sessionStore'
import { useMapStore } from '@/features/map/state/mapStore'

export function useOverviewPositions(refreshMs = MAP_REFRESH_INTERVAL_MS): DevicePosition[] {
  const [positions, setPositions] = useState<DevicePosition[]>([])
  const token = useSessionStore(state => state.token)
  const updateDevicePositions = useMapStore(state => state.updateDevicePositions)
  const fetchPositions = useCallback(async () => {
    if (!token) return

    try {
      const url = new URL('/locateme/map/positions', import.meta.env.VITE_API_URL)
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)

      const data: DevicePosition[] = await res.json()
      setPositions(data)

      const positionsById: Record<string, [number, number]> = {}
      data.forEach(pos => {
        if (pos.device_id && pos.latitude && pos.longitude) {
          const lat = parseFloat(pos.latitude as unknown as string)
          const lng = parseFloat(pos.longitude as unknown as string)
          if (!isNaN(lat) && !isNaN(lng)) {
            positionsById[pos.device_id] = [lat, lng]
          }
        }
      })

      updateDevicePositions(positionsById)
    } catch (err) {
      console.error('[useOverviewPositions] Failed to fetch map positions:', err)
    }
  }, [token, updateDevicePositions])

  useEffect(() => {
    fetchPositions()
    const interval = setInterval(fetchPositions, refreshMs)
    return () => clearInterval(interval)
  }, [fetchPositions, refreshMs])

  return positions
}
