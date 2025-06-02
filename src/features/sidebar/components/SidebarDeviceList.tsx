import { useSidebarDevices } from '@/features/devices/hooks/useSidebarDevices'
import { groupDevicesByPerson } from '@/features/devices/lib/deviceUtils'
import { SidebarDeviceGroup } from './SidebarDeviceGroup'
import { useSidebarState } from '@/features/sidebar/state/sidebarStore'

export const SidebarDeviceList = () => {
  const devices = useSidebarDevices()
  const grouped = groupDevicesByPerson(devices)
  const loading = useSidebarState(state => state.loading)
  const error = useSidebarState(state => state.error)

  if (loading) {
    return <div className="px-4 py-3 text-white text-sm">Cargando dispositivos...</div>
  }

  if (error) {
    return <div className="px-4 py-3 text-red-400 text-sm">Error: {error}</div>
  }

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
