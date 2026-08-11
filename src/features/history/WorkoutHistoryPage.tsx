import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Clock, Layers, TrendingUp, Trophy, History } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { db } from '../../db/db'
import { useProfile } from '../../context/ProfileContext'
import { computeSessionStats } from '../../utils/workout'
import { formatDateLong, formatDuration } from '../../utils/format'

export function WorkoutHistoryPage() {
  const navigate = useNavigate()
  const { profileId } = useProfile()

  const sessions = useLiveQuery(async () => {
    const finished = await db.workoutSessions
      .where('profileId')
      .equals(profileId)
      .filter((s) => s.finishedAt !== null)
      .toArray()
    finished.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
    return Promise.all(
      finished.map(async (s) => ({ session: s, stats: await computeSessionStats(s.id, s.durationSec) })),
    )
  }, [profileId])

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Antrenman Geçmişi" />

      <div className="flex flex-col gap-2 px-4 pt-4 pb-6">
        {sessions && sessions.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]">
              <History size={28} className="text-[var(--color-muted)]" />
            </div>
            <p className="text-sm text-[var(--color-muted)]">Henüz tamamlanmış bir antrenman yok.</p>
          </div>
        )}

        {sessions?.map(({ session, stats }) => (
          <button
            key={session.id}
            onClick={() => navigate(`/gecmis/${session.id}`)}
            className="rounded-2xl bg-[var(--color-surface)] p-4 text-left active:opacity-80"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="font-semibold">{session.programName}</div>
                <div className="text-xs text-[var(--color-muted)]">
                  {formatDateLong(session.finishedAt ?? session.startedAt)}
                </div>
              </div>
              {stats.prCount > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-[var(--color-gold)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--color-gold)]">
                  <Trophy size={12} /> {stats.prCount}
                </div>
              )}
            </div>
            <div className="flex gap-4 text-xs text-[var(--color-muted)]">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {formatDuration(stats.durationSec)}
              </span>
              <span className="flex items-center gap-1">
                <Layers size={14} /> {stats.totalSets} set
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp size={14} /> {stats.totalVolume} kg
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
