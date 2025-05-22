import { useSidebarState } from '../state/sidebarStore'
import { SidebarDeviceList } from './SidebarDeviceList'
import { SidebarToggleButton } from './SidebarToggleButton'

export const Sidebar = () => {
  const { collapsed } = useSidebarState()

  return (
    <div
      className={`fixed top-[10px] left-[10px] z-[9999] m-0 p-[10px] rounded-[20px] bg-blur-vp transition-[width,height] duration-300 ease-in-out
        ${collapsed ? 'rounded-full' : 'w-[250px] max-h-[calc(100vh-20px)] text-white'}
      `}
    >
      <SidebarToggleButton />
      {!collapsed && (
        <div className="p-2 overflow-y-auto max-h-[80vh]">
          <SidebarDeviceList />
        </div>
      )}
    </div>
  )
}
