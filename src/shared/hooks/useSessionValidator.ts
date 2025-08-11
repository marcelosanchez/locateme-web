import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/shared/state/sessionStore'

export function useSessionValidator() {
  const token = useSessionStore(state => state.token)
  const setSession = useSessionStore(state => state.setSession)
  const logout = useSessionStore(state => state.logout)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const didValidate = useRef(false)

  useEffect(() => {
    if (!token || didValidate.current) {
      setLoading(false)
      return
    }

    didValidate.current = true

    const validate = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 401 || res.status === 403) {
          // Token expirado o inválido - redirigir al login inmediatamente
          logout()
          navigate('/login', { replace: true })
        } else if (res.ok) {
          const data = await res.json()
          if (data?.email) {
            setSession(data, token)
          }
        } else {
          setError(`Error desconocido (${res.status})`)
        }

      } catch (err) {
        setError('No se pudo conectar al servidor')
        console.warn('[Validator] Error de red:', err)
      } finally {
        setLoading(false)
      }
    }

    validate()
  }, [token, setSession, logout, navigate])

  return { loading, error }
}
