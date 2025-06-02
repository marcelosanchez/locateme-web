import { create } from 'zustand'
import type { DeviceBasic } from '@/types/device'
import type { DevicePosition } from '@/types/deviceSnapshot'

type SidebarDevice = DeviceBasic & Pick<DevicePosition, 'latitude' | 'longitude' | 'readable_datetime'>

type SidebarState = {
  collapsed: boolean
  toggle: () => void

  devices: SidebarDevice[]
  setDevices: (devices: SidebarDevice[]) => void

  loading: boolean
  setLoading: (loading: boolean) => void

  error: string | null
  setError: (error: string | null) => void
}

export const useSidebarState = create<SidebarState>((set) => ({
  collapsed: true,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),

  devices: [],
  setDevices: (devices) => set({ devices }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  error: null,
  setError: (error) => set({ error }),
}))
