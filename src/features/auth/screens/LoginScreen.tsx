import { useState } from 'react'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/shared/state/sessionStore'

export function LoginScreen() {
  const navigate = useNavigate()
  const setUser = useSessionStore(state => state.setUser)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential
    if (!token) {
      setError('Token de autenticación no recibido.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Error signing in')
        return
      }

      if (data?.email) {
        setUser(data)
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
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Locate Me</h1>
        <p className="text-lg">Accede con tu cuenta Google</p>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Ops! login failed. Please try again.')}
        />

        {loading && <p className="text-gray-400 mt-4">Logging in...</p>}
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  )
}
