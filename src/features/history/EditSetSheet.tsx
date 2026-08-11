import { useState } from 'react'
import { motion } from 'framer-motion'
import { NumberStepper } from '../../components/common/NumberStepper'
import { weightStep } from '../../utils/steppers'
import { formatRest } from '../../utils/format'
import type { SetLog } from '../../types'

interface EditSetSheetProps {
  log: SetLog
  isCardio: boolean
  onSave: (changes: Partial<SetLog>) => void
  onClose: () => void
}

export function EditSetSheet({ log, isCardio, onSave, onClose }: EditSetSheetProps) {
  const [reps, setReps] = useState(log.reps)
  const [weight, setWeight] = useState(log.weight)
  const [durationSeconds, setDurationSeconds] = useState(log.durationSeconds ?? 0)
  const [incline, setIncline] = useState(log.incline ?? 0)

  function save() {
    if (isCardio) {
      onSave({ durationSeconds, incline: log.incline !== null ? incline : null })
    } else {
      onSave({ reps, weight })
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-t-3xl bg-[var(--color-surface)] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)]" />
        <h2 className="mb-4 text-lg font-semibold">{log.exerciseName} · Set {log.setNumber}</h2>

        <div className="flex flex-col gap-3">
          {isCardio ? (
            <>
              <NumberStepper
                label="Süre"
                value={durationSeconds}
                min={0}
                step={5}
                formatValue={formatRest}
                onChange={setDurationSeconds}
                size="lg"
              />
              {log.incline !== null && (
                <NumberStepper
                  label="Eğim (%)"
                  value={incline}
                  min={0}
                  max={15}
                  step={0.5}
                  formatValue={(v) => `%${v}`}
                  onChange={setIncline}
                  size="lg"
                />
              )}
            </>
          ) : (
            <>
              <NumberStepper label="Tekrar" value={reps} min={0} onChange={setReps} size="lg" />
              <NumberStepper label="Kilo (kg)" value={weight} min={0} step={weightStep} onChange={setWeight} size="lg" />
            </>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl bg-[var(--color-surface-2)] py-3 font-medium">
            Vazgeç
          </button>
          <button onClick={save} className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 font-semibold text-white">
            Kaydet
          </button>
        </div>
      </motion.div>
    </div>
  )
}
