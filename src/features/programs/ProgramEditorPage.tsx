import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { ExerciseCard, type ExerciseConfig } from './ExerciseCard'
import { EXERCISES } from '../../data/exercises'
import { db, newId } from '../../db/db'
import type { EditorContext } from './editorContext'

export function ProgramEditorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const incoming = (location.state as { editorContext?: EditorContext } | null)?.editorContext
  const programId = incoming?.programId

  const [name, setName] = useState(incoming?.name ?? '')
  const [configs, setConfigs] = useState<ExerciseConfig[]>(incoming?.configs ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!incoming) navigate('/programlar', { replace: true })
  }, [incoming, navigate])

  if (!incoming) return null

  function updateConfig(index: number, config: ExerciseConfig) {
    setConfigs((prev) => prev.map((c, i) => (i === index ? config : c)))
  }

  function removeConfig(index: number) {
    setConfigs((prev) => prev.filter((_, i) => i !== index))
  }

  function addExercises() {
    const editorContext: EditorContext = { programId, name, configs }
    navigate('/programlar/hareketler', { state: { editorContext } })
  }

  async function handleSave() {
    if (!name.trim() || configs.length === 0 || saving) return
    setSaving(true)
    const now = Date.now()
    let id = programId
    if (id) {
      await db.programs.update(id, { name: name.trim(), updatedAt: now })
      await db.programExercises.where('programId').equals(id).delete()
    } else {
      id = newId()
      await db.programs.add({ id, name: name.trim(), createdAt: now, updatedAt: now })
    }
    await db.programExercises.bulkAdd(
      configs.map((c, i) => ({
        id: newId(),
        programId: id!,
        exerciseId: c.exerciseId,
        order: i,
        sets: c.sets,
        reps: c.reps,
        weight: c.weight,
        restSeconds: c.restSeconds,
        durationSeconds: c.durationSeconds,
        incline: c.incline,
      })),
    )
    navigate(`/programlar/${id}`, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={programId ? 'Programı Düzenle' : 'Yeni Program'} />

      <div className="px-4 pt-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Program adı (örn. İtme Günü)"
          className="w-full rounded-xl bg-[var(--color-surface)] px-4 py-3 text-[15px] font-medium outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3 px-4 pb-28">
        {configs.map((config, i) => {
          const exercise = EXERCISES.find((e) => e.id === config.exerciseId)
          if (!exercise) return null
          return (
            <ExerciseCard
              key={config.exerciseId}
              exercise={exercise}
              config={config}
              onChange={(c) => updateConfig(i, c)}
              onRemove={() => removeConfig(i)}
            />
          )
        })}
        {configs.length === 0 && (
          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Henüz hareket yok. Aşağıdan ekleyebilirsin.
          </p>
        )}

        <button
          type="button"
          onClick={addExercises}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] py-3.5 text-sm font-medium text-[var(--color-muted)] active:bg-[var(--color-surface)]"
        >
          <Plus size={16} /> Hareket Ekle
        </button>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <button
          onClick={handleSave}
          disabled={!name.trim() || configs.length === 0 || saving}
          className="w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-center font-semibold text-white disabled:opacity-40"
        >
          Programı Kaydet
        </button>
      </div>
    </div>
  )
}
