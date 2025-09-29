import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { LoginScreen } from '@/features/auth/screens/LoginScreen'
import { MapView } from '@/features/map/components/MapView'
import { Sidebar } from '@/features/sidebar/components/Sidebar'
import { useSession } from '@/shared/hooks/useSession'
import { useSessionValidator } from '@/shared/hooks/useSessionValidator'
import { useGlobalAuthInterceptor } from '@/shared/hooks/useGlobalAuthInterceptor'
import { TrackingStatus } from '@/features/map/components/TrackingStatus'
import { OptimizedDataProvider } from '@/shared/providers/OptimizedDataProvider'
import { PWAUpdateBanner } from '@/shared/components/PWAUpdateBanner'

// layout component to protect routes
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useSession()
  const { loading } = useSessionValidator()
  
  // Enable global auth interceptor
  useGlobalAuthInterceptor()

  // Immediate redirect if no token or user
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (loading) return <div className="text-white p-4">Validando sesión...</div>

  return (
    <OptimizedDataProvider enabled={true}>
      <div className="h-screen w-screen">
        <Sidebar />
        <div className="h-screen w-screen relative">{children}</div>
        <PWAUpdateBanner />
      </div>
    </OptimizedDataProvider>
  )
}

// layout component
function LogoutRedirect() {
  const { logout } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    logout()
    setTimeout(() => {
      navigate('/login', { replace: true })
    }, 0)
  }, [logout, navigate])

  return <div className="text-white p-4">Logging out...</div>
}

// main page
function MapPage() {
  return <MapView />
}

// routes
export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/logout" element={<LogoutRedirect />} />
    <Route path="/" element={
      <ProtectedLayout>
        <MapPage />
        <TrackingStatus />
      </ProtectedLayout>
    } />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
