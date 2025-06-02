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
  setSession: (user: User, token: string) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'session-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
