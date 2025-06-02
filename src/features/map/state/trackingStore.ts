import { create } from 'zustand'
import { useSessionStore } from '@/shared/state/sessionStore'

interface TrackingStore {
  trackedDeviceId: string | null
  setTrackedDeviceId: (id: string | null) => void
  stopTracking: () => void
}

export const useTrackingStore = create<TrackingStore>((set) => ({
  trackedDeviceId: useSessionStore.getState().user?.default_device_id ?? null,
  setTrackedDeviceId: (id) => set({ trackedDeviceId: id }),
  stopTracking: () => set({ trackedDeviceId: null }),
}))
