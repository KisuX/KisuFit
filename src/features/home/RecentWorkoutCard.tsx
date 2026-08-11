import { Clock, Layers, TrendingUp } from 'lucide-react'
import type { WorkoutSession } from '../../types'
import { formatDateLong, formatDuration } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'
import { useUnitSystem } from '../../hooks/useUnitSystem'

interface RecentWorkoutCardProps {
  session: WorkoutSession
  totalSets: number
  totalVolume: number
  onClick?: () => void
}

export function RecentWorkoutCard({ session, totalSets, totalVolume, onClick }: RecentWorkoutCardProps) {
  const { t, locale } = useLanguage()
  const { label: unitLabel, toDisplay } = useUnitSystem()
  return (
    <button onClick={onClick} className="w-full rounded-2xl bg-[var(--color-surface)] p-4 text-left active:opacity-80">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-semibold">{session.programName}</div>
          <div className="text-xs text-[var(--color-muted)]">
            {formatDateLong(session.finishedAt ?? session.startedAt, locale)}
          </div>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-[var(--color-muted)]">
        <span className="flex items-center gap-1">
          <Clock size={14} /> {formatDuration(session.durationSec, locale)}
        </span>
        <span className="flex items-center gap-1">
          <Layers size={14} /> {totalSets} {t('common.set')}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp size={14} /> {toDisplay(totalVolume)} {unitLabel}
        </span>
      </div>
    </button>
  )
}
