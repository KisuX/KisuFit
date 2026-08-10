import { useState } from 'react'
import { motion } from 'framer-motion'

interface GoalWeightSheetProps {
  initialValue: number | null
  onSave: (value: number) => void
  onClose: () => void
}

export function GoalWeightSheet({ initialValue, onSave, onClose }: GoalWeightSheetProps) {
  const [value, setValue] = useState(initialValue ? String(initialValue) : '')

  function handleSave() {
    const num = parseFloat(value.replace(',', '.'))
    if (!Number.isFinite(num) || num <= 0) return
    onSave(num)
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
        <h2 className="mb-1 text-lg font-semibold">Hedef Kilo</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">Ulaşmak istediğin kiloyu belirle.</p>
        <input
          autoFocus
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="örn. 75"
          className="w-full rounded-xl bg-[var(--color-surface-2)] px-4 py-3 text-lg font-semibold outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[var(--color-surface-2)] py-3 font-medium"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 font-semibold text-white"
          >
            Kaydet
          </button>
        </div>
      </motion.div>
    </div>
  )
}
