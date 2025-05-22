import { create } from 'zustand'

export type User = {
  id: number
  email: string
  google_id?: string
  name?: string
  picture?: string
  is_staff?: boolean
}

type SessionState = {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: 'GET',
        credentials: 'include',
      })
    } catch (e) {
      console.warn('[LOGOUT] Failed to call backend logout:', e)
    }
    set({ user: null })
  },
}))