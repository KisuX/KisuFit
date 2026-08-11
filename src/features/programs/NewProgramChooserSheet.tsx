import { motion } from 'framer-motion'
import { Pencil, LayoutTemplate } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

interface NewProgramChooserSheetProps {
  onScratch: () => void
  onTemplate: () => void
  onClose: () => void
}

export function NewProgramChooserSheet({ onScratch, onTemplate, onClose }: NewProgramChooserSheetProps) {
  const { t } = useLanguage()

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
        <h2 className="mb-1 text-lg font-semibold">{t('programsList.newProgramTitle')}</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">{t('programsList.newProgramSubtitle')}</p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onTemplate}
            className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-2)] px-4 py-3.5 text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
              <LayoutTemplate size={16} className="text-[var(--color-accent)]" />
            </div>
            <span className="text-sm font-medium">{t('programsList.fromTemplate')}</span>
          </button>
          <button
            onClick={onScratch}
            className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-2)] px-4 py-3.5 text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
              <Pencil size={16} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <div className="text-sm font-medium">{t('programsList.fromScratch')}</div>
              <div className="text-xs text-[var(--color-muted)]">{t('programsList.fromScratchDesc')}</div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
