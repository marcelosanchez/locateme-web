export function haversine([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371e3 // earth radius in meters
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δφ = toRad(lat2 - lat1)
  const Δλ = toRad(lng2 - lng1)

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function filterDistantEnough(coords: [number, number][], minDistance = 10) {
  const result: [number, number][] = []
  for (const coord of coords) {
    if (
      result.length === 0 ||
      haversine(coord, result[result.length - 1]) >= minDistance
    ) {
      result.push(coord)
    }
  }
  return result
}