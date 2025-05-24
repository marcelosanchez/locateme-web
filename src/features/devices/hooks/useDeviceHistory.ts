import { useEffect, useState } from 'react'
import type { DevicePosition } from '@/types/deviceSnapshot'

export function useDeviceHistory(deviceId: string | null, limit = 4) {
  const [history, setHistory] = useState<DevicePosition[]>([])

  useEffect(() => {
    if (!deviceId) return

    const fetchHistory = async () => {
      try {
        const DEVICE_HISTORY_LIMIT = Number(import.meta.env.VITE_DEVICE_HISTORY_LIMIT || 4)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/locateme/position/history/${deviceId}?limit=${DEVICE_HISTORY_LIMIT}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        setHistory(data)
      } catch (err) {
        console.error('[useDeviceHistory] Failed to fetch device history:', err)
      }
    }

    fetchHistory()
  }, [deviceId, limit])

  return history
}
