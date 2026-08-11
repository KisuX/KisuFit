import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { PROGRAM_TEMPLATES, type ResolvedTemplate } from '../../data/programTemplates'

interface TemplatePickerSheetProps {
  onSelect: (template: ResolvedTemplate) => void
  onClose: () => void
}

export function TemplatePickerSheet({ onSelect, onClose }: TemplatePickerSheetProps) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-[var(--color-surface)] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)]" />
        <h2 className="mb-1 text-lg font-semibold">{t('programTemplates.title')}</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">{t('programTemplates.subtitle')}</p>

        <div className="flex flex-col gap-2">
          {PROGRAM_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="flex items-center justify-between rounded-xl bg-[var(--color-surface-2)] px-4 py-3.5 text-left"
            >
              <div>
                <div className="text-sm font-medium">{t(template.titleKey)}</div>
                <div className="text-xs text-[var(--color-muted)]">{t(template.descKey)}</div>
              </div>
              <ChevronRight size={18} className="text-[var(--color-muted)]" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
