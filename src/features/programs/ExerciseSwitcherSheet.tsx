import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useLanguage, translateMuscleGroup } from '../../i18n/LanguageContext'
import type { Exercise, ProgramExercise } from '../../types'

interface ExerciseSwitcherSheetProps {
  items: { pe: ProgramExercise; exercise: Exercise }[]
  completedSets: Record<string, number>
  currentIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

function totalFor(pe: ProgramExercise, exercise: Exercise) {
  return exercise.muscleGroup === 'Kardiyo' ? 1 : pe.sets
}

export function ExerciseSwitcherSheet({ items, completedSets, currentIndex, onSelect, onClose }: ExerciseSwitcherSheetProps) {
  const { t, language } = useLanguage()
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[75vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-[var(--color-surface)] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)]" />
        <h2 className="mb-1 text-lg font-semibold">{t('workout.switcherTitle')}</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">{t('workout.switcherSubtitle')}</p>
        <div className="flex flex-col gap-2">
          {items.map(({ pe, exercise }, i) => {
            const total = totalFor(pe, exercise)
            const done = Math.min(completedSets[pe.id] ?? 0, total)
            const isDone = done >= total
            const isCurrent = i === currentIndex
            return (
              <button
                key={pe.id}
                onClick={() => onSelect(i)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  isCurrent
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{exercise.name}</div>
                  <div className="text-xs text-[var(--color-muted)]">{translateMuscleGroup(exercise.muscleGroup, language)}</div>
                </div>
                {isDone ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-success)]">
                    <Check size={14} className="text-white" />
                  </div>
                ) : (
                  <div className="text-xs font-medium text-[var(--color-muted)]">
                    {t('workout.setsOf', { done, total })}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
