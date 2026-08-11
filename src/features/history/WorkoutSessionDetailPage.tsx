import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ChevronRight, Pencil, Trash2, Trophy } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { db } from '../../db/db'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage, translateMuscleGroup } from '../../i18n/LanguageContext'
import { useAllExercises } from '../../hooks/useAllExercises'
import { formatDateLong, formatRest } from '../../utils/format'
import { EditSetSheet } from './EditSetSheet'
import type { SetLog } from '../../types'

export function WorkoutSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { profileId } = useProfile()
  const { t, language, locale } = useLanguage()
  const allExercises = useAllExercises()
  const [editingLog, setEditingLog] = useState<SetLog | null>(null)

  const data = useLiveQuery(async () => {
    if (!sessionId) return null
    const session = await db.workoutSessions.get(sessionId)
    if (!session || session.profileId !== profileId) return null
    const logs = await db.setLogs.where('sessionId').equals(sessionId).sortBy('completedAt')
    return { session, logs }
  }, [sessionId, profileId])

  async function deleteSet(id: string) {
    const ok = window.confirm(t('history.deleteSetConfirm'))
    if (ok) await db.setLogs.delete(id)
  }

  async function saveEdit(log: SetLog, changes: Partial<SetLog>) {
    await db.setLogs.update(log.id, changes)
    setEditingLog(null)
  }

  if (data === undefined) return null
  if (data === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title={t('history.sessionTitle')} />
        <p className="mt-10 text-center text-sm text-[var(--color-muted)]">{t('history.notFound')}</p>
      </div>
    )
  }

  const { session, logs } = data

  const groups: { exerciseId: string; exerciseName: string; logs: SetLog[] }[] = []
  for (const log of logs) {
    let group = groups.find((g) => g.exerciseId === log.exerciseId)
    if (!group) {
      group = { exerciseId: log.exerciseId, exerciseName: log.exerciseName, logs: [] }
      groups.push(group)
    }
    group.logs.push(log)
  }

  const editingExercise = editingLog ? allExercises.find((e) => e.id === editingLog.exerciseId) : undefined
  const editingIsCardio = editingExercise?.muscleGroup === 'Kardiyo'

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={session.programName} />

      <div className="px-4 pt-2 pb-2 text-sm text-[var(--color-muted)]">
        {formatDateLong(session.finishedAt ?? session.startedAt, locale)}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-8">
        {groups.map((group) => {
          const exercise = allExercises.find((e) => e.id === group.exerciseId)
          const isCardio = exercise?.muscleGroup === 'Kardiyo'
          return (
            <div key={group.exerciseId} className="rounded-2xl bg-[var(--color-surface)] p-4">
              <button
                onClick={() => navigate(`/hareket/${group.exerciseId}`)}
                className="mb-3 flex w-full items-center justify-between text-left"
              >
                <div>
                  <div className="font-semibold">{group.exerciseName}</div>
                  {exercise && (
                    <div className="text-xs text-[var(--color-muted)]">
                      {translateMuscleGroup(exercise.muscleGroup, language)}
                    </div>
                  )}
                </div>
                <ChevronRight size={18} className="text-[var(--color-muted)]" />
              </button>

              <div className="flex flex-col gap-1.5">
                {group.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-xl bg-[var(--color-surface-2)] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--color-muted)]">
                        {t('common.set')} {log.setNumber}
                      </span>
                      <span className="font-semibold">
                        {isCardio
                          ? `${formatRest(log.durationSeconds ?? 0)}${log.incline !== null ? ` · ${t('history.inclineShort', { value: log.incline })}` : ''}`
                          : t('history.repsWeight', { reps: log.reps, weight: log.weight })}
                      </span>
                      {log.isPR && <Trophy size={14} className="text-[var(--color-gold)]" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingLog(log)}
                        aria-label={t('history.editSet')}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-border)]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteSet(log.id)}
                        aria-label={t('history.deleteSet')}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-border)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {editingLog && (
          <EditSetSheet
            log={editingLog}
            isCardio={editingIsCardio}
            onClose={() => setEditingLog(null)}
            onSave={(changes) => saveEdit(editingLog, changes)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
