import styles from './Sidebar.module.css'
import { useMapStore } from '@/features/map/state/mapStore'
import { useSelectedDeviceData, useOptimizedData } from '@/shared/providers/OptimizedDataProvider'
import type { SidebarDeviceWithPosition } from '@/features/sidebar/model/sidebar.model'

type Props = {
  device: SidebarDeviceWithPosition
}

export function SidebarDeviceItem({ device }: Props) {
  const centerMap = useMapStore(state => state.centerMap)
  const { select } = useSelectedDeviceData()
  const { getDevicePosition } = useOptimizedData()

  const handleDeviceClick = async () => {
    // Select device for real-time tracking (15s updates)
    await select(device.id)
    
    // Try to get position from optimized store first
    const position = getDevicePosition(device.id)
    
    if (position?.latitude && position?.longitude) {
      const coords: [number, number] = [
        parseFloat(position.longitude),
        parseFloat(position.latitude)
      ]
      centerMap(coords)
    } else {
      console.log(`[${device.name}]: Fetching fresh position...`)
      // The select() call above will fetch fresh position and center map automatically
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
