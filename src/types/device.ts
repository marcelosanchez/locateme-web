export interface DeviceBasic {
  device_id: string
  device_name?: string
  device_icon?: string
  battery_level?: number | string | null
  battery_status?: string | null
}