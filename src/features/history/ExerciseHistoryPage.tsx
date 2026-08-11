import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { db } from '../../db/db'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage, translateMuscleGroup } from '../../i18n/LanguageContext'
import { useAllExercises } from '../../hooks/useAllExercises'
import { useUnitSystem } from '../../hooks/useUnitSystem'
import { getPersonalRecord } from '../../utils/workout'
import { formatRest } from '../../utils/format'
import { ExerciseProgressChart } from './ExerciseProgressChart'

export function ExerciseHistoryPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const { profileId } = useProfile()
  const { t, language, locale } = useLanguage()
  const { label: unitLabel, toDisplay } = useUnitSystem()
  const allExercises = useAllExercises()
  const exercise = allExercises.find((e) => e.id === exerciseId)
  const isCardio = exercise?.muscleGroup === 'Kardiyo'

  const data = useLiveQuery(async () => {
    if (!exerciseId) return null
    const logs = await db.setLogs
      .where('exerciseId')
      .equals(exerciseId)
      .and((l) => l.profileId === profileId)
      .sortBy('completedAt')
    const record = await getPersonalRecord(profileId, exerciseId)
    return { logs, record }
  }, [exerciseId, profileId])

  const points = useMemo(() => {
    if (!data) return []
    const byDate = new Map<string, number>()
    for (const log of data.logs) {
      const dateStr = new Date(log.completedAt).toISOString().slice(0, 10)
      const value = isCardio ? (log.durationSeconds ?? 0) : toDisplay(log.weight)
      const prev = byDate.get(dateStr)
      if (prev === undefined || value > prev) byDate.set(dateStr, value)
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }))
  }, [data, isCardio, toDisplay])

  if (!data) return null

  const recent = [...data.logs].reverse().slice(0, 15)

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={exercise?.name ?? t('exerciseHistory.title')} />

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-8">
        {exercise && (
          <div className="-mt-2 text-xs font-medium text-[var(--color-accent)] uppercase">
            {translateMuscleGroup(exercise.muscleGroup, language)}
          </div>
        )}

        {!isCardio && data.record && (
          <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface)] p-4">
            <Trophy size={18} className="text-[var(--color-gold)]" />
            <div>
              <div className="text-xs text-[var(--color-muted)]">{t('exerciseHistory.personalRecord')}</div>
              <div className="text-sm font-semibold">
                {data.record.reps} {t('common.reps')} × {toDisplay(data.record.weight)} {unitLabel}
              </div>
            </div>
          </div>
        )}

        <ExerciseProgressChart
          points={points}
          unit={isCardio ? (language === 'en' ? 's' : 'sn') : unitLabel}
          emptyLabel={t('exerciseHistory.chartEmpty')}
        />

        {recent.length > 0 && (
          <div>
            <div className="mb-2 text-sm font-semibold">{t('exerciseHistory.recentSets')}</div>
            <div className="flex flex-col gap-1.5">
              {recent.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] px-4 py-2.5"
                >
                  <span className="text-sm text-[var(--color-muted)]">
                    {new Date(log.completedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {isCardio ? formatRest(log.durationSeconds ?? 0) : `${log.reps} × ${toDisplay(log.weight)} ${unitLabel}`}
                    </span>
                    {log.isPR && <Trophy size={14} className="text-[var(--color-gold)]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recent.length === 0 && (
          <p className="mt-10 text-center text-sm text-[var(--color-muted)]">{t('exerciseHistory.noRecords')}</p>
        )}
      </div>
    </div>
  )
}
