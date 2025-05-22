import { create } from 'zustand'

interface MapStore {
  center: [number, number] | null
  setCenter: (coords: [number, number]) => void
  centerMap: (coords: [number, number]) => void
}

export const useMapStore = create<MapStore>((set, get) => ({
  center: null,

  setCenter: (coords) => {
    set({ center: coords })
  },

  centerMap: (coords) => {
    get().setCenter(coords)
  },
}))
