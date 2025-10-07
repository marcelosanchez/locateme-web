import { AppRoutes } from './routes'
import { useAppVersion } from '@/shared/hooks/useAppVersion'

export default function App() {
  // Sistema unificado de versión y actualizaciones
  const { version, updateAvailable, isUpdating } = useAppVersion()

  // Log para debugging
  if (updateAvailable) {
    console.log(`🔄 App update available - version ${version} - will auto-update shortly...`)
  }
  
  if (isUpdating) {
    console.log('🔄 App is updating - please wait...')
  }

  return <AppRoutes />
}
