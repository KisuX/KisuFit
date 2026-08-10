interface MuscleGroupChipProps {
  label: string
  active: boolean
  onClick: () => void
}

export function MuscleGroupChip({ label, active, onClick }: MuscleGroupChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]'
      }`}
    >
      {label}
    </button>
  )
}
