import maplibregl, { Marker, Popup } from 'maplibre-gl'
import { renderToString } from 'react-dom/server'
import { DevicePosition } from '@/types/deviceSnapshot'
import { DevicePopup } from '@/features/devices/components/DevicePopup'

export function renderDeviceMarkers(
  map: maplibregl.Map,
  positions: DevicePosition[],
  trackedDeviceId: string | null
): Marker[] {
  // Function to close sidebar when marker is clicked
  const closeSidebar = () => {
    // Import store and close sidebar if it's expanded
    import('@/features/sidebar/state/sidebarStore').then(({ useSidebarState }) => {
      const { collapsed, toggle } = useSidebarState.getState()
      if (!collapsed) {
        toggle()
      }
    })
  }
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
    
    // Create minimal custom element with device icon but keep default positioning
    const markerEl = document.createElement('div')
    markerEl.style.width = '42px'
    markerEl.style.height = '42px'
    markerEl.style.borderRadius = '50%'
    markerEl.style.backgroundColor = 'rgba(72, 72, 74, 0.4)'
    markerEl.style.display = 'flex'
    markerEl.style.alignItems = 'center'
    markerEl.style.justifyContent = 'center'
    markerEl.style.fontSize = '22px'
    markerEl.style.color = 'white'
    markerEl.style.border = '2px solid #636365'
    markerEl.style.backdropFilter = 'blur(6px)'
    markerEl.style.boxShadow = '0 0 6px rgba(0, 0, 0, 0.2)'
    markerEl.style.userSelect = 'none'
    markerEl.innerText = pos.device_icon || '📍'
    
    // Add click event to close sidebar
    markerEl.addEventListener('click', closeSidebar)
    
    // Use custom element but NO ANCHOR specified = default positioning behavior
    const marker = new maplibregl.Marker({ element: markerEl })
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
        const popupHtml = renderToString(<DevicePopup device={trackedPos} />)

        // Create minimal custom element for tracked device with blue styling
        const trackedEl = document.createElement('div')
        trackedEl.style.width = '42px'
        trackedEl.style.height = '42px'
        trackedEl.style.borderRadius = '50%'
        trackedEl.style.backgroundColor = 'rgba(72, 72, 74, 0.8)'
        trackedEl.style.display = 'flex'
        trackedEl.style.alignItems = 'center'
        trackedEl.style.justifyContent = 'center'
        trackedEl.style.fontSize = '22px'
        trackedEl.style.color = 'white'
        trackedEl.style.border = '1px solid rgba(0, 122, 255, 0.5)'
        trackedEl.style.boxShadow = '0 0 12px rgba(0, 122, 255, 0.2)'
        trackedEl.style.transform = 'scale(1.1)'
        trackedEl.style.position = 'relative'
        trackedEl.innerText = trackedPos.device_icon || '📍'
        
        // Add minimal pulse ring effect
        const ring = document.createElement('div')
        ring.className = 'pulse-ring'
        trackedEl.appendChild(ring)
        
        // Add click event to close sidebar
        trackedEl.addEventListener('click', closeSidebar)
        
        // Use custom element but NO ANCHOR specified = default positioning behavior
        trackedMarker = new maplibregl.Marker({ element: trackedEl })
          .setLngLat([lng, lat])
          .setPopup(new Popup({ offset: 25, closeButton: false }).setHTML(popupHtml))
          .addTo(map)

        markers.push(trackedMarker)
      }
    }
  }

  return markers
}
