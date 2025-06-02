import maplibregl, { Marker } from 'maplibre-gl'
import { MAP_COLORS } from '@/config/mapColors'
import { filterDistantEnough } from '@/shared/utils/geo'
import { DevicePosition } from '@/types/deviceSnapshot'

export function renderHistory(
  map: maplibregl.Map,
  history: DevicePosition[],
  trackedDeviceId: string,
  markerRef: React.MutableRefObject<Marker[]>,
  routeLineIdsRef: React.MutableRefObject<string[]>
) {
  if (!map || !trackedDeviceId || history.length < 2) return

  const coords = filterDistantEnough(
    history
      .map(p => [parseFloat(p.longitude), parseFloat(p.latitude)] as [number, number])
      .filter(([lng, lat]) => !isNaN(lat) && !isNaN(lng))
  )

  // Limpiar marcadores previos
  markerRef.current.forEach(m => m.remove())
  markerRef.current = []

  coords.forEach(([lng, lat]) => {
    const el = document.createElement('div')
    el.style.width = '10px'
    el.style.height = '10px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = MAP_COLORS.historyPoint.fill
    el.style.boxShadow = `0 0 4px ${MAP_COLORS.historyPoint.shadow}`

    const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
    markerRef.current.push(marker)
  })

  // Eliminar líneas anteriores
  routeLineIdsRef.current.forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id)
    if (map.getSource(id)) map.removeSource(id)
  })
  routeLineIdsRef.current = []

  // Dibujar nuevas líneas
  for (let i = 0; i < coords.length - 1; i++) {
    const start = coords[i]
    const end = coords[i + 1]
    const id = `history-line-${i}`
    const opacity = 1.0 - (i + 1) / (coords.length - 1) * 0.8

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [start, end] },
        properties: {},
      },
    })

    map.addLayer({
      id,
      type: 'line',
      source: id,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': MAP_COLORS.routeLine.stroke,
        'line-width': 4,
        'line-opacity': opacity,
      },
    })

    routeLineIdsRef.current.push(id)
  }
}
