import { useEffect, useState } from 'react'
import type { DeviceBasic } from '@/types/device'
import type { DevicePosition } from '@/types/deviceSnapshot'
import { REFRESH_INTERVAL } from '@/config/constants'

type MergedDevice = DeviceBasic & Pick<DevicePosition, 'latitude' | 'longitude' | 'readable_datetime'>

export function useSidebarDevices(refreshMs = REFRESH_INTERVAL.normal): MergedDevice[] {
  const [devices, setDevices] = useState<MergedDevice[]>([])

  const fetchDevices = async () => {
    try {
      const [resDevices, resPositions] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/locateme/devices`, {
          credentials: 'include',
        }),
        fetch(`${import.meta.env.VITE_API_URL}/locateme/position`)
      ])

      if (!resDevices.ok || !resPositions.ok) {
        throw new Error(`API response error: ${resDevices.status}, ${resPositions.status}`)
      }

      const devicesData: DeviceBasic[] = await resDevices.json()
      const positionsData: DevicePosition[] = await resPositions.json()

      const merged: MergedDevice[] = devicesData.map(device => {
        const position = positionsData.find(p => p.device_id === device.device_id)

        return {
          ...device,
          latitude: position?.latitude ?? '',
          longitude: position?.longitude ?? '',
          readable_datetime: position?.readable_datetime,
        }
      })

      setDevices(merged)
    } catch (error) {
      console.error('[useSidebarDevices] Failed to fetch or merge data:', error)
    }
  }

  useEffect(() => {
    fetchDevices()
    const interval = setInterval(fetchDevices, refreshMs)
    return () => clearInterval(interval)
  }, [refreshMs])

  return devices
}
