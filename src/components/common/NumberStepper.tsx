import { Minus, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import type { StepInput } from '../../utils/steppers'

interface NumberStepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  step?: StepInput
  min?: number
  max?: number
  formatValue?: (value: number) => string
  size?: 'sm' | 'lg'
}

export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = Infinity,
  formatValue,
  size = 'sm',
}: NumberStepperProps) {
  const stepAt = (direction: 'inc' | 'dec') => (typeof step === 'function' ? step(value, direction) : step)
  const dec = () => onChange(Math.max(min, roundStep(value - stepAt('dec'), stepAt('dec'))))
  const inc = () => onChange(Math.min(max, roundStep(value + stepAt('inc'), stepAt('inc'))))
  const display = formatValue ? formatValue(value) : value

  if (size === 'lg') {
    return (
      <div className="flex w-full items-center justify-between rounded-2xl bg-[var(--color-surface-2)] px-5 py-4">
        <span className="text-sm font-medium tracking-wide text-[var(--color-muted)] uppercase">{label}</span>
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={dec}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-border)] text-[var(--color-text)] active:bg-[var(--color-accent-soft)]"
            aria-label={`${label} azalt`}
          >
            <Minus size={20} />
          </motion.button>
          <span className="min-w-[3.5rem] text-center text-3xl font-bold tabular-nums">{display}</span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={inc}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-white"
            aria-label={`${label} arttır`}
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-[var(--color-surface-2)] px-2 py-2.5">
      <span className="text-[11px] font-medium tracking-wide text-[var(--color-muted)] uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={dec}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-border)] text-[var(--color-text)] active:bg-[var(--color-accent-soft)]"
          aria-label={`${label} azalt`}
        >
          <Minus size={14} />
        </motion.button>
        <span className="min-w-[2.5rem] text-center text-base font-semibold tabular-nums">{display}</span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={inc}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-white"
          aria-label={`${label} arttır`}
        >
          <Plus size={14} />
        </motion.button>
      </div>
    </div>
  )
}

function roundStep(n: number, step: number) {
  const precision = step % 1 === 0 ? 0 : 2
  return Number(n.toFixed(precision))
}
