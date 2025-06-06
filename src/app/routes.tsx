import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { LoginScreen } from '@/features/auth/screens/LoginScreen'
import { MapView } from '@/features/map/components/MapView'
import { Sidebar } from '@/features/sidebar/components/Sidebar'
import { useSession } from '@/shared/hooks/useSession'
import { useSessionValidator } from '@/shared/hooks/useSessionValidator'
import { TrackingStatus } from '@/features/map/components/TrackingStatus'

// layout component to protect routes
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSession()
  const { loading } = useSessionValidator()

  if (loading) return <div className="text-white p-4">Validando sesión...</div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="h-screen w-screen">
      <Sidebar />
      <div className="h-screen w-screen relative">{children}</div>
    </div>
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
