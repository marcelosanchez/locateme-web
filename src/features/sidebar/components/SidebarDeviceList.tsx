import { useSidebarDevices } from '@/features/devices/hooks/useSidebarDevices'
import { groupDevicesByPerson } from '@/features/devices/lib/deviceUtils'
import { SidebarDeviceGroup } from './SidebarDeviceGroup'

export const SidebarDeviceList = () => {
  const devices = useSidebarDevices()
  const grouped = groupDevicesByPerson(devices)

  return (
    <div className="space-y-6 px-3 py-2">
      {Object.entries(grouped).map(([personId, group]) => (
        <SidebarDeviceGroup
          key={personId}
          personId={+personId}
          personName={group.personName}
          personEmoji={group.personEmoji}
          devices={group.devices}
        />
      ))}
    </div>
  )
}