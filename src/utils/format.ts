export function formatDuration(totalSeconds: number, locale: string = 'tr-TR'): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const isTr = locale.startsWith('tr')
  if (h > 0) return isTr ? `${h}sa ${m}dk` : `${h}h ${m}m`
  if (m > 0) return isTr ? `${m}dk ${s}sn` : `${m}m ${s}s`
  return isTr ? `${s}sn` : `${s}s`
}

export function formatRest(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDateShort(dateStr: string, locale: string = 'tr-TR'): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

export function formatDateLong(timestamp: number, locale: string = 'tr-TR'): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function todayStr(): string {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}
