import maplibregl, { Marker, Popup } from 'maplibre-gl'
import { renderToString } from 'react-dom/server'
import { DevicePosition } from '@/types/deviceSnapshot'
import { DevicePopup } from '@/features/devices/components/DevicePopup'

export function renderDeviceMarkers(
  map: maplibregl.Map,
  positions: DevicePosition[],
  trackedDeviceId: string | null
): Marker[] {
  const markers: Marker[] = []
  let trackedMarker: Marker | null = null

  // First, render all non-tracked markers
  positions.forEach(pos => {
    if (pos.device_id === trackedDeviceId) {
      // Skip tracked device for now, render it last
      return
    }
    
    // Parse coordinates directly from position data
    const lat = parseFloat(pos.latitude)
    const lng = parseFloat(pos.longitude)
    if (isNaN(lat) || isNaN(lng)) return
    
    console.log(`[MARKER] ${pos.device_id}: lat=${lat}, lng=${lng}, setting at [${lng}, ${lat}]`)
    
    // Create device marker with proper icon
    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.style.width = '42px'
    el.style.height = '42px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = 'rgba(72, 72, 74, 0.4)'
    el.style.border = '2px solid #636365'
    el.style.display = 'flex'
    el.style.justifyContent = 'center'
    el.style.alignItems = 'center'
    el.style.fontSize = '22px'
    el.style.color = 'white'
    el.style.userSelect = 'none'
    el.style.backdropFilter = 'blur(6px)'
    el.style.boxShadow = '0 0 6px rgba(0, 0, 0, 0.2)'
    el.innerText = pos.device_icon || '📍'

    const popupHtml = renderToString(<DevicePopup device={pos} />)

    // Create popup first 
    const popup = new Popup({ offset: 25, closeButton: false }).setHTML(popupHtml)
    
    // Use default marker with custom color - this positioning works perfectly
    const marker = new maplibregl.Marker({ color: '#636365' })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map)

    markers.push(marker)
  })

  // Now render the tracked device marker LAST (so it appears on top)
  if (trackedDeviceId) {
    const trackedPos = positions.find(pos => pos.device_id === trackedDeviceId)
    if (trackedPos) {
      // Parse coordinates directly from position data
      const lat = parseFloat(trackedPos.latitude)
      const lng = parseFloat(trackedPos.longitude)
      
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log(`[TRACKED] ${trackedPos.device_id}: lat=${lat}, lng=${lng}, setting at [${lng}, ${lat}]`)
        
        const popupHtml = renderToString(<DevicePopup device={trackedPos} />)

        // Use default marker with blue color for tracked device - positioning works perfectly  
        trackedMarker = new maplibregl.Marker({ color: '#007AFF' })
          .setLngLat([lng, lat])
          .setPopup(new Popup({ offset: 25, closeButton: false }).setHTML(popupHtml))
          .addTo(map)

        markers.push(trackedMarker)
      }
    }
  }

  return markers
}
