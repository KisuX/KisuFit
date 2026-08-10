import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Play, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader'
import { Fab } from '../../components/common/Fab'
import { db, newId } from '../../db/db'
import { EXERCISES } from '../../data/exercises'
import { formatRest } from '../../utils/format'
import { MuscleDiagram } from '../../components/common/MuscleDiagram'
import type { EditorContext } from './editorContext'

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const data = useLiveQuery(async () => {
    if (!id) return null
    const program = await db.programs.get(id)
    if (!program) return null
    const exercises = await db.programExercises.where('programId').equals(id).sortBy('order')
    return { program, exercises }
  }, [id])

  async function startWorkout() {
    if (!data) return
    const sessionId = newId()
    await db.workoutSessions.add({
      id: sessionId,
      programId: data.program.id,
      programName: data.program.name,
      startedAt: Date.now(),
      finishedAt: null,
      durationSec: 0,
    })
    navigate(`/antrenman/${sessionId}`)
  }

  function editProgram() {
    if (!data) return
    const editorContext: EditorContext = {
      programId: data.program.id,
      name: data.program.name,
      configs: data.exercises.map((pe) => ({
        exerciseId: pe.exerciseId,
        sets: pe.sets,
        reps: pe.reps,
        weight: pe.weight,
        restSeconds: pe.restSeconds,
        durationSeconds: pe.durationSeconds,
        incline: pe.incline,
      })),
    }
    navigate('/programlar/editor', { state: { editorContext } })
  }

  async function deleteProgram() {
    if (!data) return
    const ok = window.confirm(`"${data.program.name}" programını silmek istediğine emin misin?`)
    if (!ok) return
    await db.programExercises.where('programId').equals(data.program.id).delete()
    await db.programs.delete(data.program.id)
    navigate('/programlar', { replace: true })
  }

  if (data === undefined) return null
  if (data === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title="Program" />
        <p className="mt-10 text-center text-sm text-[var(--color-muted)]">Program bulunamadı.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title={data.program.name}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={editProgram}
              aria-label="Programı düzenle"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface)]"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={deleteProgram}
              aria-label="Programı sil"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface)]"
            >
              <Trash2 size={18} />
            </button>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-2 px-4 pt-4 pb-28">
        {data.exercises.map((pe, i) => {
          const ex = EXERCISES.find((e) => e.id === pe.exerciseId)
          if (!ex) return null
          return (
            <div key={pe.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-surface)] px-4 py-3">
              <MuscleDiagram muscleGroup={ex.muscleGroup} className="h-11 w-7 shrink-0" />
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[10px] font-semibold text-[var(--color-muted)]">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{ex.name}</div>
                <div className="text-xs text-[var(--color-muted)]">{ex.muscleGroup}</div>
              </div>
              <div className="text-right text-xs text-[var(--color-muted)]">
                {ex.muscleGroup === 'Kardiyo' ? (
                  <>
                    <div className="font-semibold text-[var(--color-text)]">{formatRest(pe.durationSeconds)}</div>
                    <div>{ex.supportsIncline ? `Eğim %${pe.incline ?? 0}` : 'Kardiyo'}</div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-[var(--color-text)]">
                      {pe.sets} x {pe.reps}
                    </div>
                    <div>
                      {pe.weight} kg · {formatRest(pe.restSeconds)}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Fab onClick={startWorkout} icon={<Play size={24} className="ml-0.5" />} aria-label="Antrenmanı başlat" />
    </div>
  )
}
