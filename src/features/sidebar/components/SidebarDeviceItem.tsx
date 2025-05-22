import { useMapStore } from '@/features/map/state/mapStore'
import type { SidebarDeviceWithPosition } from '@/features/sidebar/model/sidebar.model'

type Props = {
  device: SidebarDeviceWithPosition
}

export function SidebarDeviceItem({ device }: Props) {
  const centerMap = useMapStore(state => state.centerMap)

  return (
    <div
      className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
      onClick={() => {
        const lat = parseFloat(device.latitude)
        const lng = parseFloat(device.longitude)
        if (!isNaN(lat) && !isNaN(lng)) {
          centerMap([lng, lat])
        } else {
          console.warn(`[${device.name}]: Invalid coordinates`, device.latitude, device.longitude)
        }
      }}
    >
      <span className="text-xl">{device.icon || '📍'}</span>
      <span className="text-sm text-white truncate">
        {device.name || device.id}
      </span>
    </div>
  )
}