export interface SidebarDevice {
  id: string
  name: string
  icon: string
  emoji?: string
}

export interface SidebarPerson {
  id: string
  name: string
  devices: SidebarDevice[]
}

export type SidebarDeviceGroupProps = {
  personName: string
  personEmoji: string
  personId: number
  devices: SidebarDeviceWithPosition[]
}

export type GroupedSidebarDevices = Record<number, {
  personName: string
  personEmoji: string
  devices: SidebarDevice[]
}>

export interface SidebarDevice {
  id: string
  name: string
  icon: string
  emoji?: string
}

export interface SidebarDeviceWithPosition extends SidebarDevice {
  latitude: string
  longitude: string
}
