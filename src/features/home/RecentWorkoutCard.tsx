import { Clock, Layers, TrendingUp } from 'lucide-react'
import type { WorkoutSession } from '../../types'
import { formatDateLong, formatDuration } from '../../utils/format'

interface RecentWorkoutCardProps {
  session: WorkoutSession
  totalSets: number
  totalVolume: number
}

export function RecentWorkoutCard({ session, totalSets, totalVolume }: RecentWorkoutCardProps) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-semibold">{session.programName}</div>
          <div className="text-xs text-[var(--color-muted)]">{formatDateLong(session.finishedAt ?? session.startedAt)}</div>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-[var(--color-muted)]">
        <span className="flex items-center gap-1">
          <Clock size={14} /> {formatDuration(session.durationSec)}
        </span>
        <span className="flex items-center gap-1">
          <Layers size={14} /> {totalSets} set
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp size={14} /> {totalVolume} kg
        </span>
      </div>
    </div>
  )
}
