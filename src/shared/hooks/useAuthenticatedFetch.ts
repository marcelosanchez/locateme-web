import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from './useSession'
import { SessionExpiredError } from '../errors/SessionExpiredError'

export function useAuthenticatedFetch() {
  const { token, logout } = useSession()
  const navigate = useNavigate()

  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!token) {
      logout()
      navigate('/login', { replace: true })
      throw new SessionExpiredError('No authentication token available')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    })

    // Si recibimos 401 o 403, significa que el token expiró o es inválido
    if (response.status === 401 || response.status === 403) {
      logout()
      navigate('/login', { replace: true })
      throw new SessionExpiredError('Session expired')
    }

    return response
  }, [token, logout, navigate])

  return authenticatedFetch
}