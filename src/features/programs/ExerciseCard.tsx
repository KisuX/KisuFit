import { X } from 'lucide-react'
import { NumberStepper } from '../../components/common/NumberStepper'
import { MuscleDiagram } from '../../components/common/MuscleDiagram'
import { formatRest } from '../../utils/format'
import type { Exercise } from '../../types'

export interface ExerciseConfig {
  exerciseId: string
  sets: number
  reps: number
  weight: number
  restSeconds: number
  durationSeconds: number
  incline: number | null
}

interface ExerciseCardProps {
  exercise: Exercise
  config: ExerciseConfig
  onChange: (config: ExerciseConfig) => void
  onRemove: () => void
}

export function ExerciseCard({ exercise, config, onChange, onRemove }: ExerciseCardProps) {
  const isCardio = exercise.muscleGroup === 'Kardiyo'

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4">
      <div className="mb-3 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2">
        <MuscleDiagram muscleGroup={exercise.muscleGroup} className="h-11 w-7 shrink-0" />
        <div className="text-[15px] font-semibold leading-tight">{exercise.name}</div>
        <div className="justify-self-center pt-0.5 text-xs text-[var(--color-muted)]">{exercise.muscleGroup}</div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hareketi kaldır"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface-2)]"
        >
          <X size={16} />
        </button>
      </div>

      {isCardio ? (
        <div className="grid grid-cols-2 gap-2">
          <NumberStepper
            label="Süre"
            value={config.durationSeconds}
            min={60}
            step={60}
            formatValue={formatRest}
            onChange={(v) => onChange({ ...config, durationSeconds: v })}
          />
          {exercise.supportsIncline && (
            <NumberStepper
              label="Eğim (%)"
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
            label="Set"
            value={config.sets}
            min={1}
            onChange={(v) => onChange({ ...config, sets: v })}
          />
          <NumberStepper
            label="Tekrar"
            value={config.reps}
            min={1}
            onChange={(v) => onChange({ ...config, reps: v })}
          />
          <NumberStepper
            label="Kilo (kg)"
            value={config.weight}
            min={0}
            step={2.5}
            onChange={(v) => onChange({ ...config, weight: v })}
          />
          <NumberStepper
            label="Dinlenme"
            value={config.restSeconds}
            min={0}
            step={15}
            formatValue={formatRest}
            onChange={(v) => onChange({ ...config, restSeconds: v })}
          />
        </div>
      )}
    </div>
  )
}
