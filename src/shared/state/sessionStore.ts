import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type User = {
  id: number
  email: string
  google_id?: string
  name?: string
  picture?: string
  is_staff?: boolean
  default_device_id?: string
}

type SessionState = {
  user: User | null
  token: string | null
  isHydrated: boolean
  setSession: (user: User, token: string) => void
  logout: () => void
  setHydrated: (hydrated: boolean) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setSession: (user, token) => set({ user, token, isHydrated: true }),
      logout: () => set({ user: null, token: null }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'session-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.log('Session hydration error:', error)
          } else {
            state?.setHydrated(true)
          }
        }
      },
    }
  )
)
