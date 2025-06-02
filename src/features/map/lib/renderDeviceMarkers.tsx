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

  positions.forEach(pos => {
    const lat = parseFloat(pos.latitude)
    const lng = parseFloat(pos.longitude)
    if (isNaN(lat) || isNaN(lng)) return

    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.style.width = '42px'
    el.style.height = '42px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = '#48484a'
    el.style.border = '2px solid #636365'
    el.style.display = 'flex'
    el.style.justifyContent = 'center'
    el.style.alignItems = 'center'
    el.style.fontSize = '22px'
    el.style.color = 'white'
    el.style.userSelect = 'none'
    el.innerText = pos.device_icon || '📍'

    if (pos.device_id === trackedDeviceId) {
      const ring = document.createElement('div')
      ring.className = 'pulse-ring'
      el.appendChild(ring)
    }

    const popupHtml = renderToString(<DevicePopup device={pos} />)

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(new Popup({ offset: 25, closeButton: false }).setHTML(popupHtml))
      .addTo(map)

    markers.push(marker)
  })

  return markers
}
