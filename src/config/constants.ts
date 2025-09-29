export const DEFAULT_MAP_CENTER: [number, number] = [-59.0, -15.0]
export const DEFAULT_ZOOM = 3
export const MAX_ZOOM = 19

export const MAP_ATTRIBUTION = 'Locate Me'

export const API_BASE_URL = 'https://api.synclab.dev/locateme'

// Optimized API endpoints
export const OPTIMIZED_API_ENDPOINTS = {
  sidebarDeviceNames: '/optimized/sidebar/device-names',
  mapDevicePositions: '/optimized/map/device-positions', 
  singleDevicePosition: '/optimized/devices/:deviceId/position',
  batchPositions: '/optimized/map/batch-positions',
  deviceRoute: '/optimized/devices/:deviceId/route'
}

export const REFRESH_INTERVAL = {
  sidebarNames: 300000,    // 5 minutes (names rarely change)
  selectedDevice: 15000,   // 15 seconds (high priority)
  otherDevices: 45000,     // 45 seconds (normal priority)
  mapInitial: 30000,       // 30 seconds (initial map load)
}

// Legacy intervals (keep for backward compatibility)
export const LEGACY_REFRESH_INTERVAL = {
  normal: 30000, // 30 segundos
  fast: 5000, // 5 segundos
  tracking: 2000, // 2 segundos
}

export const MAP_REFRESH_INTERVAL_MS = 15000 // 15 seconds
