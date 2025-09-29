import { useSidebarData } from '@/shared/providers/OptimizedDataProvider'
import { groupDevicesByPerson } from '@/features/devices/lib/deviceUtils'
import { SidebarDeviceGroup } from './SidebarDeviceGroup'

export const SidebarDeviceList = () => {
  const { devices, loading, error } = useSidebarData()
  
  // Transform optimized data to match existing interface
  const transformedDevices = devices.map(device => ({
    device_id: device.device_id,
    device_name: device.device_name,
    device_icon: device.device_icon,
    device_type: device.device_type,
    person_name: device.person_name,
    is_primary: device.is_primary,
    // No position data needed for sidebar
    latitude: null,
    longitude: null,
    readable_datetime: null
  }))
  
  const grouped = groupDevicesByPerson(transformedDevices)

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
