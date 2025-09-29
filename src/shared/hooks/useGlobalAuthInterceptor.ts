import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from './useSession'

/**
 * Global interceptor that monitors all fetch requests
 * and automatically redirects to login on 401/403 responses
 */
export function useGlobalAuthInterceptor() {
  const { logout } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    // Store original fetch
    const originalFetch = window.fetch

    // Create interceptor
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // Check for authentication errors
        if (response.status === 401 || response.status === 403) {
          // Check if this is an API call (not external resources)
          const url = args[0]
          const isApiCall = typeof url === 'string' && 
            (url.includes('/locateme/') || url.includes('/auth/'))
          
          if (isApiCall) {
            console.warn('[Auth Interceptor] Session expired, redirecting to login')
            logout()
            navigate('/login', { replace: true })
          }
        }
        
        return response
      } catch (error) {
        // Network errors or other issues
        throw error
      }
    }

    // Cleanup: restore original fetch on unmount
    return () => {
      window.fetch = originalFetch
    }
  }, [logout, navigate])
}