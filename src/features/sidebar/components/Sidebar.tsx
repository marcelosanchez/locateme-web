import styles from './Sidebar.module.css'
import { useSidebarState } from '../state/sidebarStore'
import { SidebarDeviceList } from './SidebarDeviceList'
import { SidebarToggleButton } from './SidebarToggleButton'
import { useSession } from '@/shared/hooks/useSession'

export const Sidebar = () => {
  const { collapsed } = useSidebarState()
  const { logout } = useSession()

  return (
    <div
      className={`${styles.wrapper} ${collapsed ? 'rounded-full w-auto' : 'w-[250px]'}`}
    >
      <SidebarToggleButton />
      {!collapsed && (
        <div className={styles.content}>
          <SidebarDeviceList />
          <button className={styles.logoutButton} onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
