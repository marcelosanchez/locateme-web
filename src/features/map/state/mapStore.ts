import { create } from 'zustand'
import maplibregl from 'maplibre-gl'

interface MapStore {
  map: maplibregl.Map | null
  setMap: (map: maplibregl.Map | null) => void

  center: [number, number] | null
  setCenter: (coords: [number, number]) => void
  centerMap: (coords: [number, number]) => void

  defaultDeviceCentered: boolean
  setDefaultDeviceCentered: () => void
  centerDefaultDeviceOnce: (deviceId: string) => void

  geoCentered: boolean
  setGeoCentered: () => void

  devicePositions: Record<string, [number, number]> // device_id -> [lat, lng]
  updateDevicePositions: (positions: Record<string, [number, number]>) => void
  getDevicePosition: (deviceId: string) => [number, number] | null
}

export const useMapStore = create<MapStore>((set, get) => ({
  map: null,
  setMap: (map) => set({ map }),

  center: null,

  setCenter: (coords) => {
    set({ center: coords })
  },

  centerMap: (coords) => {
    get().setCenter(coords)
  },

  defaultDeviceCentered: false,

  setDefaultDeviceCentered: () => {
    set({ defaultDeviceCentered: true })
  },

  centerDefaultDeviceOnce: (deviceId: string) => {
    const state = get()
    if (state.defaultDeviceCentered) return
    const coords = state.devicePositions[deviceId]
    if (coords) {
      state.centerMap(coords)
      state.setDefaultDeviceCentered()
    }
  },

  geoCentered: false,

  setGeoCentered: () => {
    set({ geoCentered: true })
  },

  devicePositions: {},

  updateDevicePositions: (positions) => {
    const converted: Record<string, [number, number]> = {}
    for (const id in positions) {
      const [lat, lng] = positions[id]
      converted[id] = [lng, lat]  // important: MapLibre uses [lng, lat] format
    }
    set({ devicePositions: converted })
  },

  getDevicePosition: (deviceId) => {
    return get().devicePositions[deviceId] || null
  },
}))
