import { useEffect, useState, useCallback } from 'react'
import type { DevicePosition } from '@/types/deviceSnapshot'
import { MAP_REFRESH_INTERVAL_MS } from '@/config/constants'
import { useSessionStore } from '@/shared/state/sessionStore'
import { useMapStore } from '@/features/map/state/mapStore'
import { useAuthenticatedFetch } from '@/shared/hooks/useAuthenticatedFetch'
import { isSessionExpiredError } from '@/shared/errors/SessionExpiredError'

export function useOverviewPositions(refreshMs = MAP_REFRESH_INTERVAL_MS): DevicePosition[] {
  const [positions, setPositions] = useState<DevicePosition[]>([])
  const token = useSessionStore(state => state.token)
  const updateDevicePositions = useMapStore(state => state.updateDevicePositions)
  const authenticatedFetch = useAuthenticatedFetch()
  
  const fetchPositions = useCallback(async () => {
    if (!token) return

    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}/locateme/map/positions`)
      const res = await authenticatedFetch(url.toString(), {
        method: 'GET',
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
            // Store as [lat, lng] for mapStore conversion to [lng, lat]
            positionsById[pos.device_id] = [lat, lng]
          }
        }
      })

      updateDevicePositions(positionsById)
    } catch (err) {
      // if session expired, useAuthenticatedFetch already handled login redirect
      if (!isSessionExpiredError(err)) {
        console.error('[useOverviewPositions] Failed to fetch map positions:', err)
      }
    }
  }, [token, updateDevicePositions, authenticatedFetch])

  useEffect(() => {
    fetchPositions()
    const interval = setInterval(fetchPositions, refreshMs)
    return () => clearInterval(interval)
  }, [fetchPositions, refreshMs])

  return positions
}
