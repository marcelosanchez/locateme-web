import { useState } from 'react'
import { CredentialResponse } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/shared/state/sessionStore'
import { PulseVisual } from '@/ui/elements/PulseVisual'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'

// Import background image
const backgroundImage = '/images/login/background.png'

// Helper to get the correct API URL for auth endpoints
const getAuthApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL
  // If VITE_API_URL ends with /locateme, remove it for auth endpoints
  return apiUrl.endsWith('/locateme') ? apiUrl.replace('/locateme', '') : apiUrl
}

export function LoginScreen() {
  const navigate = useNavigate()
  const setSession = useSessionStore(state => state.setSession)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const googleToken = credentialResponse.credential
    if (!googleToken) {
      setError('Token de autenticación no recibido.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${getAuthApiUrl()}/auth/google/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Error signing in')
        return
      }

      if (data?.token && data?.user?.email) {
        setSession(data.user, data.token)
        navigate('/')
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('[Login Error]', err)
      setError('Network error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen min-h-screen w-full relative overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        maxWidth: 'none'
      }}
    >
      {/* Map Background Image */}
      <img
        src={backgroundImage}
        alt="Map background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Light Overlay for subtle darkening */}
      <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Centreador a pantalla completa */}
        <div className="min-h-screen w-screen flex items-center justify-center">
          {/* Main Content (ancho fijo 300px) con glassmorphism idéntico a TrackingStatus */}
          <div className="w-[300px] text-center space-y-8"
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              // backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Pulse Animation */}
            <div className="flex justify-center mb-8">
              <PulseVisual centerColor="#1e3878" waveColor="#12d04f" size={120} />
            </div>

            {/* App Title */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Locate Me
              </h1>
            </div>

            {/* Google Login Button Container */}
            <div className="space-y-6">
              {!loading ? (
                <GoogleLoginButton
                  onSuccess={handleSuccess}
                  onError={() => setError('Error en el login. Inténtalo de nuevo.')}
                />
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                    <p className="text-white/90 font-medium">Iniciando sesión...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
                  <p className="text-red-200 text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/50 text-xs">
          Acceso seguro con Google OAuth
        </p>
      </div>
    </div>
  )
}
