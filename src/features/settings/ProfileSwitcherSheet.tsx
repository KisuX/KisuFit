import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import { db, newId } from '../../db/db'
import { useLanguage } from '../../i18n/LanguageContext'
import type { Profile } from '../../types'

interface ProfileSwitcherSheetProps {
  currentProfileId: string
  onSelect: (profile: Profile) => void
  onClose: () => void
}

export function ProfileSwitcherSheet({ currentProfileId, onSelect, onClose }: ProfileSwitcherSheetProps) {
  const { t } = useLanguage()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    db.profiles.toArray().then(setProfiles)
  }, [])

  async function createProfile() {
    if (!name.trim() || creating) return
    setCreating(true)
    const profile: Profile = { id: newId(), name: name.trim(), createdAt: Date.now() }
    await db.profiles.add(profile)
    onSelect(profile)
  }

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
        <h2 className="mb-4 text-lg font-semibold">{t('profileSwitcher.title')}</h2>

        <div className="flex flex-col gap-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => (p.id === currentProfileId ? onClose() : onSelect(p))}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
                p.id === currentProfileId
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
              }`}
            >
              <span className="text-sm font-medium">{p.name}</span>
              {p.id === currentProfileId && <Check size={16} className="text-[var(--color-accent)]" />}
            </button>
          ))}
        </div>

        {showCreate ? (
          <div className="mt-4">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profileSwitcher.newProfilePlaceholder')}
              className="mb-3 w-full rounded-xl bg-[var(--color-surface-2)] px-4 py-3 text-[15px] font-medium outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            <button
              onClick={createProfile}
              disabled={!name.trim() || creating}
              className="w-full rounded-xl bg-[var(--color-accent)] py-3 text-center font-semibold text-white disabled:opacity-40"
            >
              {t('profileSwitcher.createAndSwitch')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-muted)]"
          >
            <Plus size={16} /> {t('profileSwitcher.createNew')}
          </button>
        )}
      </motion.div>
    </div>
  )
}
