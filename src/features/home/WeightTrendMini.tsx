import type { BodyWeightEntry } from '../../types'
import { useLanguage } from '../../i18n/LanguageContext'

interface WeightTrendMiniProps {
  entries: BodyWeightEntry[]
}

export function WeightTrendMini({ entries }: WeightTrendMiniProps) {
  const { t } = useLanguage()
  const recent = entries.slice(-10)
  if (recent.length < 2) {
    return <p className="text-sm text-[var(--color-muted)]">{t('home.trendEmpty')}</p>
  }

  const weights = recent.map((e) => e.weight)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = max - min || 1
  const w = 260
  const h = 56
  const points = recent
    .map((e, i) => {
      const x = (i / (recent.length - 1)) * w
      const y = h - ((e.weight - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-14 flex-1" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="text-right">
        <div className="text-lg font-bold">{recent[recent.length - 1].weight} kg</div>
        <div className="text-xs text-[var(--color-muted)]">{t('home.latestEntry')}</div>
      </div>
    </div>
  )
}
