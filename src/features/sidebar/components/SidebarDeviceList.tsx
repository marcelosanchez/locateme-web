import { useSidebarDevices } from '@/features/devices/hooks/useSidebarDevices'
import { groupDevicesByPerson } from '@/features/devices/lib/deviceUtils'
import { SidebarDeviceGroup } from './SidebarDeviceGroup'

export const SidebarDeviceList = () => {
  const devices = useSidebarDevices()
  const loading = false // useSidebarDevices manages its own loading state
  const error = null // useSidebarDevices manages its own error state
  
  const grouped = groupDevicesByPerson(devices)

  if (loading) {
    return (
      <div className="px-4 py-3 flex items-center space-x-3">
        <div 
          className="inline-block animate-spin rounded-full border-2 border-solid border-white border-r-transparent w-4 h-4"
          role="status"
          aria-label="Cargando"
        >
          <span className="sr-only">Cargando...</span>
        </div>
        <span className="text-white text-sm">Cargando dispositivos...</span>
      </div>
    )
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
