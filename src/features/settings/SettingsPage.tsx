import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AlertTriangle, Download, Upload, User, ChevronRight, Bell, MessageSquareText, Info, Languages } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { db, deleteProfile, resetProfileData, settingKey } from '../../db/db'
import { clearActiveProfileId } from '../../db/profile'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { Language } from '../../i18n/translations'
import { useNotificationsEnabled } from '../../hooks/useNotificationsEnabled'
import { notificationPermission, requestNotificationPermission } from '../../utils/notifications'
import { buildBackup, downloadBackup, importBackup, parseBackupFile, type BackupData } from '../../utils/backup'
import { ProfileSwitcherSheet } from './ProfileSwitcherSheet'
import { ImportBackupSheet } from './ImportBackupSheet'
import { FeedbackSheet } from './FeedbackSheet'

export function SettingsPage() {
  const navigate = useNavigate()
  const { profileId, profileName, switchProfile } = useProfile()
  const { t, language, setLanguage } = useLanguage()
  const notificationsEnabled = useNotificationsEnabled()
  const [resetting, setResetting] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null)
  const [importError, setImportError] = useState('')
  const [notificationsBlocked, setNotificationsBlocked] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleReset() {
    const ok = window.confirm(t('settings.resetConfirm'))
    if (!ok || resetting) return
    setResetting(true)
    await resetProfileData(profileId)
    setResetting(false)
    navigate('/', { replace: true })
  }

  async function handleDeleteProfile() {
    const ok = window.confirm(t('settings.deleteProfileConfirm', { name: profileName }))
    if (!ok) return
    await deleteProfile(profileId)
    clearActiveProfileId()
    window.location.reload()
  }

  async function toggleNotifications() {
    if (notificationsEnabled) {
      await db.settings.put({ key: settingKey(profileId, 'notificationsEnabled'), profileId, value: 'false' })
      return
    }
    setNotificationsBlocked(false)
    let permission = notificationPermission()
    if (permission === 'default') permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      setNotificationsBlocked(true)
      return
    }
    await db.settings.put({ key: settingKey(profileId, 'notificationsEnabled'), profileId, value: 'true' })
  }

  async function handleExport() {
    const data = await buildBackup(profileId, profileName)
    downloadBackup(data)
  }

  async function handleFileChosen(file: File | undefined) {
    if (!file) return
    setImportError('')
    try {
      const data = await parseBackupFile(file, {
        unreadable: t('backupImport.unreadableFile'),
        invalid: t('backupImport.invalidFile'),
      })
      setPendingImport(data)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : t('settings.importFileError'))
    }
  }

  async function confirmImport(name: string) {
    if (!pendingImport) return
    const newProfileId = await importBackup(pendingImport, name)
    setPendingImport(null)
    const profile = await db.profiles.get(newProfileId)
    if (profile) switchProfile(profile.id, profile.name)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={t('settings.title')} />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-3 text-sm font-semibold">{t('settings.profile')}</div>
          <button
            onClick={() => setSwitcherOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl bg-[var(--color-surface-2)] px-4 py-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
              <User size={16} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{profileName}</div>
              <div className="text-xs text-[var(--color-muted)]">{t('settings.switchProfileHint')}</div>
            </div>
            <ChevronRight size={18} className="text-[var(--color-muted)]" />
          </button>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Languages size={16} /> {t('settings.language')}
          </div>
          <p className="mb-3 text-sm text-[var(--color-muted)]">{t('settings.languageHint')}</p>
          <div className="flex gap-2">
            {(['tr', 'en'] as Language[]).map((lng) => (
              <button
                key={lng}
                onClick={() => setLanguage(lng)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
                  language === lng ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                }`}
              >
                {lng === 'tr' ? 'Türkçe' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <button onClick={toggleNotifications} className="flex w-full items-center gap-3 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
              <Bell size={16} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{t('settings.notifications')}</div>
              <p className="text-xs text-[var(--color-muted)]">{t('settings.notificationsHint')}</p>
            </div>
            <span
              className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                notificationsEnabled ? 'justify-end bg-[var(--color-accent)]' : 'justify-start bg-[var(--color-border)]'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white" />
            </span>
          </button>
          {notificationsBlocked && <p className="mt-3 text-xs text-red-400">{t('settings.notificationsBlocked')}</p>}
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <MessageSquareText size={16} /> {t('settings.feedback')}
          </div>
          <p className="mb-4 text-sm text-[var(--color-muted)]">{t('settings.feedbackHint')}</p>
          <button
            onClick={() => setFeedbackOpen(true)}
            className="w-full rounded-xl bg-[var(--color-surface-2)] py-3 text-center text-sm font-semibold"
          >
            {t('settings.feedbackSend')}
          </button>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-1 text-sm font-semibold">{t('settings.backup')}</div>
          <p className="mb-4 text-sm text-[var(--color-muted)]">{t('settings.backupHint')}</p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-2)] py-3 text-sm font-semibold"
            >
              <Download size={16} /> {t('settings.export')}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-2)] py-3 text-sm font-semibold"
            >
              <Upload size={16} /> {t('settings.import')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                handleFileChosen(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>
          {importError && <p className="mt-3 text-xs text-red-400">{importError}</p>}
        </div>

        <button
          onClick={() => navigate('/ayarlar/hakkinda')}
          className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] p-4 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
            <Info size={16} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{t('settings.about')}</div>
            <p className="text-xs text-[var(--color-muted)]">{t('settings.aboutHint')}</p>
          </div>
          <ChevronRight size={18} className="text-[var(--color-muted)]" />
        </button>

        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-400">
            <AlertTriangle size={16} /> {t('settings.dangerZone')}
          </div>
          <p className="mb-4 text-sm text-[var(--color-muted)]">{t('settings.resetHint')}</p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="mb-3 w-full rounded-xl bg-red-500/15 py-3 text-center text-sm font-semibold text-red-400 disabled:opacity-50"
          >
            {resetting ? t('settings.resetting') : t('settings.resetButton')}
          </button>
          <button
            onClick={handleDeleteProfile}
            className="w-full rounded-xl border border-red-500/30 py-3 text-center text-sm font-semibold text-red-400"
          >
            {t('settings.deleteProfile')}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {switcherOpen && (
          <ProfileSwitcherSheet
            currentProfileId={profileId}
            onClose={() => setSwitcherOpen(false)}
            onSelect={(profile) => {
              switchProfile(profile.id, profile.name)
              setSwitcherOpen(false)
              navigate('/', { replace: true })
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingImport && (
          <ImportBackupSheet
            data={pendingImport}
            onClose={() => setPendingImport(null)}
            onConfirm={confirmImport}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{feedbackOpen && <FeedbackSheet onClose={() => setFeedbackOpen(false)} />}</AnimatePresence>
    </div>
  )
}
