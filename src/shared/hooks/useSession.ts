import { useEffect, useState } from 'react'
import { useSessionStore } from '@/shared/state/sessionStore'

export function useSession() {
  const user = useSessionStore(state => state.user)
  const setUser = useSessionStore(state => state.setUser)
  const logout = useSessionStore(state => state.logout)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(false)
      return
    }

    fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      credentials: 'include',
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.email) {
          setUser(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [user, setUser])

  return { user, loading, logout }
}
