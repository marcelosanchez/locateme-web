import { useEffect, useState } from 'react'
import { MAP_REFRESH_INTERVAL_MS } from '@/config/constants'
import type { DevicePosition } from '@/types/deviceSnapshot'

export function useDeviceHistory(deviceId: string | null, limit = 4, refreshMs = MAP_REFRESH_INTERVAL_MS) {
  const [history, setHistory] = useState<DevicePosition[]>([])

  const fetchHistory = async () => {
    if (!deviceId) return
    try {
      const DEVICE_HISTORY_LIMIT = Number(import.meta.env.VITE_DEVICE_HISTORY_LIMIT || limit)
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

  useEffect(() => {
    fetchHistory()

    if (!deviceId || !refreshMs) return

    const interval = setInterval(() => {
      fetchHistory()
    }, refreshMs)

    return () => clearInterval(interval)
  }, [deviceId, refreshMs])

  return history
}
