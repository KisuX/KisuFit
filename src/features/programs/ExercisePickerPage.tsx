import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Check, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../components/layout/PageHeader'
import { MuscleGroupChip } from '../../components/common/MuscleGroupChip'
import { MUSCLE_GROUPS } from '../../data/exercises'
import { useAllExercises } from '../../hooks/useAllExercises'
import { mergeConfigs, type EditorContext } from './editorContext'
import { AddCustomExerciseSheet } from './AddCustomExerciseSheet'

export function ExercisePickerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const incoming = (location.state as { editorContext?: EditorContext } | null)?.editorContext
  const allExercises = useAllExercises()

  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<string>('Tümü')
  const [selected, setSelected] = useState<string[]>(() => incoming?.configs.map((c) => c.exerciseId) ?? [])
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(() => {
    return allExercises.filter((e) => {
      const matchesGroup = group === 'Tümü' || e.muscleGroup === group
      const matchesQuery = e.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))
      return matchesGroup && matchesQuery
    })
  }, [allExercises, query, group])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function proceed() {
    const configs = mergeConfigs(incoming?.configs ?? [], selected, allExercises)
    const editorContext: EditorContext = { programId: incoming?.programId, name: incoming?.name ?? '', configs }
    navigate('/programlar/editor', { state: { editorContext } })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Hareket Seç" />

      <div className="px-4 pt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hareket ara..."
            className="w-full rounded-xl bg-[var(--color-surface)] py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <MuscleGroupChip label="Tümü" active={group === 'Tümü'} onClick={() => setGroup('Tümü')} />
          {MUSCLE_GROUPS.map((g) => (
            <MuscleGroupChip key={g} label={g} active={group === g} onClick={() => setGroup(g)} />
          ))}
        </div>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-4 pb-28">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-muted)] active:bg-[var(--color-surface)]"
        >
          <Plus size={16} /> Kendi Hareketini Ekle
        </button>

        <div className="flex flex-col gap-2">
          {filtered.map((ex) => {
            const isSelected = selected.includes(ex.id)
            return (
              <motion.button
                key={ex.id}
                type="button"
                onClick={() => toggle(ex.id)}
                whileTap={{ scale: 0.98 }}
                animate={{
                  backgroundColor: isSelected ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                  borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                }}
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{ex.name}</div>
                  <div className="text-xs text-[var(--color-muted)]">{ex.muscleGroup}</div>
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)]">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </motion.button>
            )
          })}
          {filtered.length === 0 && (
            <p className="mt-10 text-center text-sm text-[var(--color-muted)]">Hareket bulunamadı</p>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <button
            onClick={proceed}
            className="w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-center font-semibold text-white"
          >
            Devam Et ({selected.length})
          </button>
        </div>
      )}

      <AnimatePresence>
        {addOpen && (
          <AddCustomExerciseSheet
            onClose={() => setAddOpen(false)}
            onAdded={(exercise) => {
              setSelected((prev) => [...prev, exercise.id])
              setAddOpen(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
