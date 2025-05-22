// src/config/constants.ts

export const DEFAULT_MAP_CENTER: [number, number] = [-79.8917431, -2.150542]
export const DEFAULT_ZOOM = 18
export const MAX_ZOOM = 19

export const TILE_PROVIDER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const MAP_ATTRIBUTION ='Locate Me'

export const API_BASE_URL = 'https://api.synclab.dev/locateme'

export const REFRESH_INTERVAL = {
  normal: 30000, // 60 segundos
  fast: 5000, // 5 segundos
}