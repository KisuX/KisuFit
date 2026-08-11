import type { ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { Trophy, Clock, Layers, TrendingUp } from 'lucide-react'
import { db } from '../../db/db'
import { computeSessionStats } from '../../utils/workout'
import { formatDuration } from '../../utils/format'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage } from '../../i18n/LanguageContext'

export function WorkoutSummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { profileId } = useProfile()
  const { t } = useLanguage()

  const data = useLiveQuery(async () => {
    if (!sessionId) return null
    const session = await db.workoutSessions.get(sessionId)
    if (!session || session.profileId !== profileId) return null
    const stats = await computeSessionStats(sessionId, session.durationSec)
    return { session, stats }
  }, [sessionId, profileId])

  if (data === undefined) return null
  if (data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">{t('workoutSummary.notFound')}</p>
      </div>
    )
  }

  const { session, stats } = data

  return (
    <div className="flex min-h-screen flex-col px-5 pt-10">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
          <Trophy size={30} className="text-[var(--color-accent)]" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{t('workoutSummary.title')}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{session.programName}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <StatCard icon={<Clock size={18} />} label={t('workoutSummary.duration')} value={formatDuration(stats.durationSec)} />
        <StatCard icon={<Layers size={18} />} label={t('workoutSummary.totalSets')} value={String(stats.totalSets)} />
        <StatCard
          icon={<TrendingUp size={18} />}
          label={t('workoutSummary.totalVolume')}
          value={`${stats.totalVolume} ${t('common.kg')}`}
        />
        <StatCard
          icon={<Trophy size={18} />}
          label={t('workoutSummary.newRecord')}
          value={String(stats.prCount)}
          accent={stats.prCount > 0}
        />
      </div>

      {stats.prExerciseNames.length > 0 && (
        <div className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)]">
            <Trophy size={16} /> {t('workoutSummary.recordsBroken')}
          </div>
          <ul className="flex flex-col gap-1 text-sm text-[var(--color-muted)]">
            {stats.prExerciseNames.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={() => navigate(`/gecmis/${sessionId}`)}
        className="mt-8 w-full rounded-xl bg-[var(--color-surface)] py-3 text-center text-sm font-medium"
      >
        {t('workoutSummary.viewDetails')}
      </button>
      <button
        onClick={() => navigate('/programlar', { replace: true })}
        className="mb-10 mt-3 w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-center font-semibold text-white"
      >
        {t('workoutSummary.finish')}
      </button>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4">
      <div className={`mb-2 ${accent ? 'text-[var(--color-gold)]' : 'text-[var(--color-muted)]'}`}>{icon}</div>
      <div className={`text-xl font-bold ${accent ? 'text-[var(--color-gold)]' : ''}`}>{value}</div>
      <div className="text-xs text-[var(--color-muted)]">{label}</div>
    </div>
  )
}
