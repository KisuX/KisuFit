import { useState } from 'react'
import { motion } from 'framer-motion'
import type { BackupData } from '../../utils/backup'
import { useLanguage } from '../../i18n/LanguageContext'

interface ImportBackupSheetProps {
  data: BackupData
  onConfirm: (profileName: string) => void
  onClose: () => void
}

export function ImportBackupSheet({ data, onConfirm, onClose }: ImportBackupSheetProps) {
  const { t } = useLanguage()
  const [name, setName] = useState(data.profileName)

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
        <h2 className="mb-1 text-lg font-semibold">{t('backupImport.title')}</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          {t('backupImport.summary', {
            programs: data.programs.length,
            sessions: data.workoutSessions.length,
            weights: data.bodyWeightEntries.length,
          })}
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('backupImport.profileNamePlaceholder')}
          className="mb-4 w-full rounded-xl bg-[var(--color-surface-2)] px-4 py-3 text-[15px] font-medium outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl bg-[var(--color-surface-2)] py-3 font-medium">
            {t('common.cancel')}
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 font-semibold text-white disabled:opacity-40"
          >
            {t('backupImport.importAction')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
