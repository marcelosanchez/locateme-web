import { useState } from 'react'
import type { SidebarDeviceGroupProps } from '@/features/sidebar/model/sidebar.model'
import { SidebarDeviceItem } from './SidebarDeviceItem'
import styles from './Sidebar.module.css'

export function SidebarDeviceGroup({ personName, personEmoji, devices }: SidebarDeviceGroupProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={styles.groupHeader}
      >
        <div className={styles.groupTitle}>
          <span className="text-lg">{personEmoji} </span>
          <span>{personName}</span>
        </div>
        <span className={styles.groupArrow}>{isOpen ? '▾' : '▸'}</span>
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
