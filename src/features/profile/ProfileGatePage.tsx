import { useEffect, useState } from 'react'
import { ChevronRight, User } from 'lucide-react'
import { db, newId } from '../../db/db'
import { setActiveProfileId } from '../../db/profile'
import { useLanguage } from '../../i18n/LanguageContext'
import type { Profile } from '../../types'

interface ProfileGatePageProps {
  onReady: (profileId: string, profileName: string) => void
}

export function ProfileGatePage({ onReady }: ProfileGatePageProps) {
  const { t } = useLanguage()
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    db.profiles.toArray().then(setProfiles)
  }, [])

  async function createProfile() {
    if (!name.trim() || creating) return
    setCreating(true)
    const profile: Profile = { id: newId(), name: name.trim(), createdAt: Date.now() }
    await db.profiles.add(profile)
    setActiveProfileId(profile.id)
    onReady(profile.id, profile.name)
  }

  function selectProfile(profile: Profile) {
    setActiveProfileId(profile.id)
    onReady(profile.id, profile.name)
  }

  if (profiles === null) return null

  const showWelcomeForm = profiles.length === 0 || showCreateForm

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center bg-[var(--color-bg)] px-6">
      {showWelcomeForm ? (
        <>
          <h1 className="text-2xl font-bold">
            {profiles.length === 0 ? t('profileGate.welcomeTitle') : t('profileGate.newProfileTitle')}
          </h1>
          <p className="mt-1 mb-6 text-sm text-[var(--color-muted)]">
            {profiles.length === 0 ? t('profileGate.welcomeSubtitle') : t('profileGate.newProfileSubtitle')}
          </p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('profileGate.namePlaceholder')}
            className="mb-4 w-full rounded-xl bg-[var(--color-surface)] px-4 py-3 text-[15px] font-medium outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <button
            onClick={createProfile}
            disabled={!name.trim() || creating}
            className="w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-center font-semibold text-white disabled:opacity-40"
          >
            {t('profileGate.start')}
          </button>
          {profiles.length > 0 && (
            <button
              onClick={() => setShowCreateForm(false)}
              className="mt-3 w-full rounded-xl py-3 text-center text-sm font-medium text-[var(--color-muted)]"
            >
              {t('profileGate.cancel')}
            </button>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">{t('profileGate.chooseProfile')}</h1>
          <p className="mt-1 mb-6 text-sm text-[var(--color-muted)]">{t('profileGate.chooseProfileSubtitle')}</p>
          <div className="flex flex-col gap-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProfile(p)}
                className="flex items-center gap-3 rounded-xl bg-[var(--color-surface)] px-4 py-3 text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                  <User size={16} className="text-[var(--color-muted)]" />
                </div>
                <span className="flex-1 text-sm font-medium">{p.name}</span>
                <ChevronRight size={18} className="text-[var(--color-muted)]" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 w-full rounded-xl border border-dashed border-[var(--color-border)] py-3 text-center text-sm font-medium text-[var(--color-muted)]"
          >
            {t('profileGate.createNew')}
          </button>
        </>
      )}
    </div>
  )
}
