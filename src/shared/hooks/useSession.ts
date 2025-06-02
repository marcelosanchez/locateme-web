import { useSessionStore } from '@/shared/state/sessionStore'

export function useSession() {
  const user = useSessionStore(state => state.user)
  const token = useSessionStore(state => state.token)
  const setSession = useSessionStore(state => state.setSession)
  const logout = useSessionStore(state => state.logout)

  // console.log('[MapView] User from sessionStore:', user)
  return { user, token, setSession, logout }
}
