import styles from './Sidebar.module.css'
import { useMapStore } from '@/features/map/state/mapStore'
import { useTrackingStore } from '@/features/map/state/trackingStore'
import { useSidebarState } from '@/features/sidebar/state/sidebarStore'
import type { SidebarDeviceWithPosition } from '@/features/sidebar/model/sidebar.model'

type Props = {
  device: SidebarDeviceWithPosition
}

export function SidebarDeviceItem({ device }: Props) {
  const centerMap = useMapStore(state => state.centerMap)
  const getDevicePosition = useMapStore(state => state.getDevicePosition)
  const setTrackedDeviceId = useTrackingStore(state => state.setTrackedDeviceId)
  const { collapse } = useSidebarState()

  const handleDeviceClick = () => {
    // Select device for tracking
    setTrackedDeviceId(device.id)
    
    // Try to get position from map store
    const coords = getDevicePosition(device.id)
    
    if (coords) {
      centerMap(coords)
      console.log(`[${device.name}]: Centered map on device position`)
      collapse() // close sidebar after centering the map
    } else {
      console.log(`[${device.name}]: Position not available yet`)
    }
  }

  return (
    <div
      className={styles.deviceItem}
      onClick={handleDeviceClick}
    >
      <span className={styles.deviceIcon}>{device.icon || '📍'}</span>
      <span className={styles.deviceName}>{device.name || device.id}</span>
    </div>
  )
}
