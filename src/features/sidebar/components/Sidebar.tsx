import styles from './Sidebar.module.css'
import { useSidebarState } from '../state/sidebarStore'
import { SidebarDeviceList } from './SidebarDeviceList'
import { SidebarToggleButton } from './SidebarToggleButton'
import { useSession } from '@/shared/hooks/useSession'
import { useAppVersion } from '@/shared/hooks/useAppVersion'

export const Sidebar = () => {
  const { collapsed } = useSidebarState()
  const { logout } = useSession()
  const { version, updateAvailable, isUpdating, forceUpdate } = useAppVersion()

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
          <div 
            className={`${styles.versionText} ${updateAvailable ? styles.updateAvailable : ''} ${isUpdating ? styles.updating : ''}`}
            onClick={forceUpdate}
            title={updateAvailable ? "¡Actualización disponible! Click para actualizar" : "Forzar actualización completa"}
          >
            v{version} {updateAvailable && '🔄'} {isUpdating && '⏳'}
          </div>
        </div>
      )}
    </div>
  )
}
