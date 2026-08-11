import type { PointerEvent } from 'react'
import { GripVertical, X, Link2 } from 'lucide-react'
import { NumberStepper } from '../../components/common/NumberStepper'
import { formatRest } from '../../utils/format'
import { useLanguage, translateMuscleGroup } from '../../i18n/LanguageContext'
import { useUnitSystem } from '../../hooks/useUnitSystem'
import type { Exercise } from '../../types'

export interface ExerciseConfig {
  exerciseId: string
  sets: number
  reps: number
  weight: number
  restSeconds: number
  durationSeconds: number
  incline: number | null
  linkedToNext?: boolean
}

interface ExerciseCardProps {
  exercise: Exercise
  config: ExerciseConfig
  onChange: (config: ExerciseConfig) => void
  onRemove: () => void
  onDragHandlePointerDown?: (event: PointerEvent) => void
  isLast?: boolean
}

export function ExerciseCard({ exercise, config, onChange, onRemove, onDragHandlePointerDown, isLast }: ExerciseCardProps) {
  const { t, language } = useLanguage()
  const { label: unitLabel, toDisplay, toKg, step: weightStep } = useUnitSystem()
  const isCardio = exercise.muscleGroup === 'Kardiyo'

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4">
      <div className="mb-3 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2">
        <button
          type="button"
          onPointerDown={onDragHandlePointerDown}
          aria-label={t('exerciseCard.dragHandle')}
          className="flex h-7 w-7 cursor-grab items-center justify-center rounded-full text-[var(--color-muted)] active:cursor-grabbing active:bg-[var(--color-surface-2)]"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={16} />
        </button>
        <div className="text-[15px] font-semibold leading-tight">{exercise.name}</div>
        <div className="justify-self-center pt-0.5 text-xs text-[var(--color-muted)]">
          {translateMuscleGroup(exercise.muscleGroup, language)}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('exerciseCard.removeExercise')}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface-2)]"
        >
          <X size={16} />
        </button>
      </div>

      {isCardio ? (
        <div className="grid grid-cols-2 gap-2">
          <NumberStepper
            label={t('exerciseCard.duration')}
            value={config.durationSeconds}
            min={60}
            step={60}
            formatValue={formatRest}
            onChange={(v) => onChange({ ...config, durationSeconds: v })}
          />
          {exercise.supportsIncline && (
            <NumberStepper
              label={t('exerciseCard.incline')}
              value={config.incline ?? 0}
              min={0}
              max={15}
              step={0.5}
              formatValue={(v) => `%${v}`}
              onChange={(v) => onChange({ ...config, incline: v })}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <NumberStepper
            label={t('exerciseCard.set')}
            value={config.sets}
            min={1}
            onChange={(v) => onChange({ ...config, sets: v })}
          />
          <NumberStepper
            label={t('exerciseCard.reps')}
            value={config.reps}
            min={1}
            onChange={(v) => onChange({ ...config, reps: v })}
          />
          <NumberStepper
            label={`${t('exerciseCard.weight')} (${unitLabel})`}
            value={toDisplay(config.weight)}
            min={0}
            step={weightStep}
            onChange={(v) => onChange({ ...config, weight: toKg(v) })}
          />
          <NumberStepper
            label={t('exerciseCard.rest')}
            value={config.restSeconds}
            min={0}
            step={15}
            formatValue={formatRest}
            onChange={(v) => onChange({ ...config, restSeconds: v })}
          />
        </div>
      )}

      {!isLast && (
        <button
          type="button"
          onClick={() => onChange({ ...config, linkedToNext: !config.linkedToNext })}
          className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold ${
            config.linkedToNext
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'
          }`}
        >
          <Link2 size={13} /> {config.linkedToNext ? t('exerciseCard.removeFromSuperset') : t('exerciseCard.addToSuperset')}
        </button>
      )}
    </div>
  )
}
