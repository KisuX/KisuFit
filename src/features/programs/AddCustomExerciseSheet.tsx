import { useState } from 'react'
import { motion } from 'framer-motion'
import { MuscleGroupChip } from '../../components/common/MuscleGroupChip'
import { db, newId } from '../../db/db'
import { MUSCLE_GROUPS } from '../../data/exercises'
import { useLanguage, translateMuscleGroup } from '../../i18n/LanguageContext'
import type { Exercise, MuscleGroup } from '../../types'

interface AddCustomExerciseSheetProps {
  onAdded: (exercise: Exercise) => void
  onClose: () => void
}

export function AddCustomExerciseSheet({ onAdded, onClose }: AddCustomExerciseSheetProps) {
  const { t, language } = useLanguage()
  const [name, setName] = useState('')
  const [group, setGroup] = useState<MuscleGroup | null>(null)
  const [supportsIncline, setSupportsIncline] = useState(false)

  async function handleSave() {
    if (!name.trim() || !group) return
    const exercise: Exercise = {
      id: newId(),
      name: name.trim(),
      muscleGroup: group,
      supportsIncline: group === 'Kardiyo' && supportsIncline ? true : undefined,
    }
    await db.exercises.add(exercise)
    onAdded(exercise)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-[var(--color-surface)] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)]" />
        <h2 className="mb-1 text-lg font-semibold">{t('customExercise.title')}</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">{t('customExercise.subtitle')}</p>

        <label className="mb-1.5 block text-xs font-medium text-[var(--color-muted)] uppercase">{t('customExercise.nameLabel')}</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('customExercise.namePlaceholder')}
          className="mb-4 w-full rounded-xl bg-[var(--color-surface-2)] px-4 py-3 text-[15px] font-medium outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />

        <label className="mb-1.5 block text-xs font-medium text-[var(--color-muted)] uppercase">{t('customExercise.muscleGroupLabel')}</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((g) => (
            <MuscleGroupChip key={g} label={translateMuscleGroup(g, language)} active={group === g} onClick={() => setGroup(g)} />
          ))}
        </div>

        {group === 'Kardiyo' && (
          <button
            type="button"
            onClick={() => setSupportsIncline((v) => !v)}
            className="mb-4 flex w-full items-center justify-between rounded-xl bg-[var(--color-surface-2)] px-4 py-3"
          >
            <span className="text-sm">{t('customExercise.inclineQuestion')}</span>
            <span
              className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                supportsIncline ? 'justify-end bg-[var(--color-accent)]' : 'justify-start bg-[var(--color-border)]'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white" />
            </span>
          </button>
        )}

        <div className="mt-2 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl bg-[var(--color-surface-2)] py-3 font-medium">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !group}
            className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 font-semibold text-white disabled:opacity-40"
          >
            {t('common.add')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
