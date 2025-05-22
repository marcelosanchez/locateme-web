/**
 * Converts a readable UTC date string to local format
 * If invalid, returns an empty string
 *
 * @param readableDatetimeUtc - String with UTC date (e.g., '2024-05-20T18:30:00')
 * @returns Locally formatted date or empty string
 */
export function formatLocalTime(readableDatetimeUtc: string | null): string {
  if (!readableDatetimeUtc) return ''

  const dateUtc = new Date(`${readableDatetimeUtc}Z`)

  if (isNaN(dateUtc.getTime())) {
    console.warn('Invalid datetime:', readableDatetimeUtc)
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateUtc)
}
