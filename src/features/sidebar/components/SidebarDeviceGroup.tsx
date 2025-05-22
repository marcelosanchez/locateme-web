import { useState } from 'react'
import type { SidebarDeviceGroupProps } from '@/features/sidebar/model/sidebar.model'
import { SidebarDeviceItem } from './SidebarDeviceItem'

export function SidebarDeviceGroup({ personName, personEmoji, devices }: SidebarDeviceGroupProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between text-white font-medium text-sm mb-2 px-2 py-1 rounded hover:bg-white/10 transition"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{personEmoji}</span>
          <span>{personName}</span>
        </div>
        <span className="text-xs">{isOpen ? '▾' : '▸'}</span>
      </button>

      {isOpen && (
        <div className="space-y-1">
          {devices.map(device => (
            <SidebarDeviceItem key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  )
}