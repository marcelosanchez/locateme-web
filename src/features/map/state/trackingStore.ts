import { create } from 'zustand'

interface TrackingState {
  trackedDeviceId: string | null
  setTrackedDeviceId: (deviceId: string | null) => void
}

export const useTrackingStore = create<TrackingState>((set) => ({
  trackedDeviceId: null,
  setTrackedDeviceId: (deviceId) => set({ trackedDeviceId: deviceId }),
}))
