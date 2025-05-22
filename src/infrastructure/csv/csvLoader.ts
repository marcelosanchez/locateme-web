import { parseCsvTextToRows, parseLatestPositionRow, DevicePosition } from './csvParser'

export async function loadLatestPositions(): Promise<DevicePosition[]> {
  const positions: DevicePosition[] = []

  try {
    const indexRes = await fetch('/records/index.json')
    const csvFiles: string[] = await indexRes.json()

    for (const file of csvFiles) {
      try {
        const response = await fetch(`/records/${file}`)
        const text = await response.text()
        const rows = parseCsvTextToRows(text)
        const lastRow = rows[rows.length - 1]
        if (lastRow) {
          const position = parseLatestPositionRow(lastRow)
          positions.push(position)
        }
      } catch (error) {
        console.warn(`Error loading ${file}`, error)
      }
    }
  } catch (err) {
    console.error('Error loading CSV index', err)
  }

  return positions
}