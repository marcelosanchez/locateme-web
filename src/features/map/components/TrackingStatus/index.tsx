import { useTrackingStore } from '@/features/map/state/trackingStore'
import { useSidebarDevices } from '@/features/devices/hooks/useSidebarDevices'
import { useOverviewPositions } from '@/features/devices/hooks/useOverviewPositions'
import { formatDistanceToNowStrict } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './styles.module.css'
import { useEffect, useMemo, useState } from 'react'

const REFRESH_INTERVAL = 30 * 1000 // 30 seconds

export function TrackingStatus() {
  const trackedDeviceId = useTrackingStore(state => state.trackedDeviceId)
  const stopTracking = useTrackingStore(state => state.stopTracking)
  const devices = useSidebarDevices()
  const positions = useOverviewPositions()

  const device = devices.find(d => d.device_id === trackedDeviceId)
  const position = positions.find(p => p.device_id === trackedDeviceId)

  const [lastSeenText, setLastSeenText] = useState<string>('desconocido')

  // Re-calculate last seen time every 30 seconds
  useEffect(() => {
    if (!position?.readable_datetime) return

    const updateTime = () => {
      const text = formatDistanceToNowStrict(
        new Date(position.readable_datetime + 'Z'),
        { addSuffix: true, locale: es }
      )
      setLastSeenText(text)
    }

    updateTime() // calculate immediately
    const interval = setInterval(updateTime, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [position?.readable_datetime])

  // Calculate battery level only when device changes
  const battery = useMemo(() => {
    const level = device?.battery_level

    const numericLevel = typeof level === 'number'
      ? level
      : typeof level === 'string' && !isNaN(Number(level))
        ? parseFloat(level)
        : null

    return numericLevel !== null ? `${Math.round(numericLevel)}%` : 'N/A'
  }, [device?.battery_level])

  if (!trackedDeviceId || !device || !position) return null

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.container} bg-blur-vp`}>
        <div className={styles.info}>
          <div className={styles.name}>{device.device_name}</div>
          <div className={styles.details}>
            <div>🕒 {lastSeenText}</div>
            <div>🔋 {battery}</div>
          </div>
        </div>

        <div className={styles.button} onClick={stopTracking}>
          Dejar<br />de<br />Seguir
        </div>
      </div>
    </div>
  )
}
