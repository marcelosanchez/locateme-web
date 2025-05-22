import { formatLocalTime } from '@/shared/utils/dateUtils'
import type { DevicePosition } from '@/types/deviceSnapshot'

type Props = {
  device: DevicePosition
}

export function DevicePopup({ device }: Props) {
  return (
    <div className="popup-content">
      <div className="popup-title">{device.device_name}</div>
      <div className="popup-time">{formatLocalTime(device.readable_datetime ?? '')}</div>
      {/* add more device info here */}
    </div>
  )
}
