import Papa from 'papaparse'

export interface DevicePosition {
  device_id: string
  latitude: number
  longitude: number
  timestamp: number
  device_name: string
  device_icon: string
  readable_datetime: string
}

export function parseCsvTextToRows(csvText: string): string[][] {
  const parsed = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  })

  return parsed.data as string[][]
}

export function parseLatestPositionRow(row: string[]): DevicePosition {
  const [
    device_id,
    , , , , // skip unused fields
    lat,
    lng,
    timestamp,
    device_name,
    device_icon,
    readable_datetime,
  ] = row

  return {
    device_id,
    latitude: parseFloat(lat),
    longitude: parseFloat(lng),
    timestamp: parseInt(timestamp),
    device_name,
    device_icon,
    readable_datetime,
  }
}
