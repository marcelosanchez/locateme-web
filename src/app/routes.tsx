import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LoginScreen } from '@/features/auth/screens/LoginScreen'
import { MapView } from '@/features/map/components/MapView'
import { Sidebar } from '@/features/sidebar/components/Sidebar'
import { useSession } from '@/shared/hooks/useSession'
import { useEffect } from 'react'

// layout component to protect routes
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession()
  if (loading) {
    return <div className="text-white p-4">Checking session...</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="h-screen w-screen">
      <Sidebar />
      <div className="h-screen w-screen relative">
        {children}
      </div>
    </div>
  )
}

// layout component
function LogoutRedirect() {
  const { logout } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    logout().finally(() => {
      navigate('/login', { replace: true })
    })
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
    <Route path="/" element={<ProtectedLayout><MapPage /></ProtectedLayout>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
