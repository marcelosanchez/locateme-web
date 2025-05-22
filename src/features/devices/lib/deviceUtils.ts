import { SidebarDeviceGroupProps, SidebarDeviceWithPosition } from '@/features/sidebar/model/sidebar.model'
import type { DevicePosition } from '@/types/deviceSnapshot'

export function groupDevicesByPerson(devices: DevicePosition[]) {
  return devices
    .filter(d => d.person_id !== undefined)
    .reduce<Record<number, Omit<SidebarDeviceGroupProps, 'personId'>>>((acc, d) => {
      const personId = d.person_id as number

      if (!acc[personId]) {
        acc[personId] = {
          personName: d.person_name ?? 'Unknown',
          personEmoji: d.person_emoji ?? '👤',
          devices: [],
        }
      }

      const device: SidebarDeviceWithPosition = {
        id: d.device_id,
        name: d.device_name ?? d.device_id,
        icon: d.device_icon ?? '📍',
        emoji: d.person_emoji,
        latitude: d.latitude,
        longitude: d.longitude,
      }

      acc[personId].devices.push(device)
      return acc
    }, {})
}
