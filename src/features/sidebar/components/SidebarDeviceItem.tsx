import styles from './Sidebar.module.css'
import { useMapStore } from '@/features/map/state/mapStore'
import { useTrackingStore } from '@/features/map/state/trackingStore'
import type { SidebarDeviceWithPosition } from '@/features/sidebar/model/sidebar.model'

type Props = {
  device: SidebarDeviceWithPosition
}

export function SidebarDeviceItem({ device }: Props) {
  const centerMap = useMapStore(state => state.centerMap)
  const devicePositions = useMapStore(state => state.devicePositions)
  const setTrackedDeviceId = useTrackingStore(state => state.setTrackedDeviceId)

  return (
    <div
      className={styles.deviceItem}
      onClick={() => {
        setTrackedDeviceId(device.id)
        const coords = devicePositions[device.id]
        if (coords) {
          centerMap(coords)
        } else {
          console.log(`[${device.name}]: No position found in store`)
        }
      }}
    >
      <span className={styles.deviceIcon}>{device.icon || '📍'}</span>
      <span className={styles.deviceName}>{device.name || device.id}</span>
    </div>
  )
}
