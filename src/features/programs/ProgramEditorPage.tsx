import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Reorder, useDragControls } from 'framer-motion'
import { PageHeader } from '../../components/layout/PageHeader'
import { ExerciseCard, type ExerciseConfig } from './ExerciseCard'
import { useAllExercises } from '../../hooks/useAllExercises'
import { db, newId } from '../../db/db'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { EditorContext } from './editorContext'
import type { Exercise } from '../../types'

interface SortableExerciseCardProps {
  exercise: Exercise
  config: ExerciseConfig
  onChange: (config: ExerciseConfig) => void
  onRemove: () => void
  isLast: boolean
}

function SortableExerciseCard({ exercise, config, onChange, onRemove, isLast }: SortableExerciseCardProps) {
  const dragControls = useDragControls()
  return (
    <Reorder.Item value={config} dragListener={false} dragControls={dragControls} as="div">
      <ExerciseCard
        exercise={exercise}
        config={config}
        onChange={onChange}
        onRemove={onRemove}
        onDragHandlePointerDown={(e) => dragControls.start(e)}
        isLast={isLast}
      />
    </Reorder.Item>
  )
}

export function ProgramEditorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const incoming = (location.state as { editorContext?: EditorContext } | null)?.editorContext
  const programId = incoming?.programId
  const allExercises = useAllExercises()
  const { profileId } = useProfile()
  const { t } = useLanguage()

  const [name, setName] = useState(incoming?.name ?? '')
  const [configs, setConfigs] = useState<ExerciseConfig[]>(incoming?.configs ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!incoming) navigate('/programlar', { replace: true })
  }, [incoming, navigate])

  if (!incoming) return null

  function updateConfig(exerciseId: string, config: ExerciseConfig) {
    setConfigs((prev) => prev.map((c) => (c.exerciseId === exerciseId ? config : c)))
  }

  function removeConfig(exerciseId: string) {
    setConfigs((prev) => prev.filter((c) => c.exerciseId !== exerciseId))
  }

  /** Sürükle-bırak sırasında bir eşleşmenin komşusu değiştiyse, artık anlamsızlaşan süper set bağını temizler. */
  function handleReorder(next: ExerciseConfig[]) {
    const oldNextId = new Map(configs.map((c, i) => [c.exerciseId, configs[i + 1]?.exerciseId]))
    setConfigs(
      next.map((c, i) => {
        if (!c.linkedToNext) return c
        const newNextId = next[i + 1]?.exerciseId
        return newNextId === oldNextId.get(c.exerciseId) ? c : { ...c, linkedToNext: false }
      }),
    )
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
      await db.programs.add({ id, profileId, name: name.trim(), createdAt: now, updatedAt: now })
    }
    await db.programExercises.bulkAdd(
      configs.map((c, i) => ({
        id: newId(),
        profileId,
        programId: id!,
        exerciseId: c.exerciseId,
        order: i,
        sets: c.sets,
        reps: c.reps,
        weight: c.weight,
        restSeconds: c.restSeconds,
        durationSeconds: c.durationSeconds,
        incline: c.incline,
        linkedToNext: c.linkedToNext ?? false,
      })),
    )
    navigate(`/programlar/${id}`, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={programId ? t('programEditor.titleEdit') : t('programEditor.titleNew')} />

      <div className="px-4 pt-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('programEditor.namePlaceholder')}
          className="w-full rounded-xl bg-[var(--color-surface)] px-4 py-3 text-[15px] font-medium outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      <div className="mt-4 flex flex-1 flex-col px-4 pb-28">
        <Reorder.Group as="div" axis="y" values={configs} onReorder={handleReorder} className="flex flex-col gap-3">
          {configs.map((config, i) => {
            const exercise = allExercises.find((e) => e.id === config.exerciseId)
            if (!exercise) return null
            return (
              <SortableExerciseCard
                key={config.exerciseId}
                exercise={exercise}
                config={config}
                onChange={(c) => updateConfig(config.exerciseId, c)}
                onRemove={() => removeConfig(config.exerciseId)}
                isLast={i === configs.length - 1}
              />
            )
          })}
        </Reorder.Group>
        {configs.length === 0 && (
          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">{t('programEditor.emptyState')}</p>
        )}

        <button
          type="button"
          onClick={addExercises}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] py-3.5 text-sm font-medium text-[var(--color-muted)] active:bg-[var(--color-surface)]"
        >
          <Plus size={16} /> {t('programEditor.addExercise')}
        </button>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <button
          onClick={handleSave}
          disabled={!name.trim() || configs.length === 0 || saving}
          className="w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-center font-semibold text-white disabled:opacity-40"
        >
          {t('programEditor.saveProgram')}
        </button>
      </div>
    </div>
  )
}
