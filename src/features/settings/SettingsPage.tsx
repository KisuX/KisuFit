import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AlertTriangle, Download, Upload, User, ChevronRight } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { db, deleteProfile, resetProfileData } from '../../db/db'
import { clearActiveProfileId } from '../../db/profile'
import { useProfile } from '../../context/ProfileContext'
import { buildBackup, downloadBackup, importBackup, parseBackupFile, type BackupData } from '../../utils/backup'
import { ProfileSwitcherSheet } from './ProfileSwitcherSheet'
import { ImportBackupSheet } from './ImportBackupSheet'

export function SettingsPage() {
  const navigate = useNavigate()
  const { profileId, profileName, switchProfile } = useProfile()
  const [resetting, setResetting] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null)
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleReset() {
    const ok = window.confirm(
      'Bu profildeki tüm programlar, antrenman geçmişi, kilo kayıtların ve hedefin kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?',
    )
    if (!ok || resetting) return
    setResetting(true)
    await resetProfileData(profileId)
    setResetting(false)
    navigate('/', { replace: true })
  }

  async function handleDeleteProfile() {
    const ok = window.confirm(
      `"${profileName}" profilini ve tüm verisini kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.`,
    )
    if (!ok) return
    await deleteProfile(profileId)
    clearActiveProfileId()
    window.location.reload()
  }

  async function handleExport() {
    const data = await buildBackup(profileId, profileName)
    downloadBackup(data)
  }

  async function handleFileChosen(file: File | undefined) {
    if (!file) return
    setImportError('')
    try {
      const data = await parseBackupFile(file)
      setPendingImport(data)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Dosya okunamadı.')
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
      <PageHeader title="Ayarlar" />

      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-3 text-sm font-semibold">Profil</div>
          <button
            onClick={() => setSwitcherOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl bg-[var(--color-surface-2)] px-4 py-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
              <User size={16} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{profileName}</div>
              <div className="text-xs text-[var(--color-muted)]">Profili değiştir veya yeni profil oluştur</div>
            </div>
            <ChevronRight size={18} className="text-[var(--color-muted)]" />
          </button>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-1 text-sm font-semibold">Yedekleme</div>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            Bu profildeki tüm verileri bir dosyaya kaydet, ya da daha önce aldığın bir yedeği yeni bir profile aktar.
            Veriler sadece bu cihazda tutulduğu için tarayıcı verisi silinirse kaybolur — düzenli yedek almanı
            öneririz.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-2)] py-3 text-sm font-semibold"
            >
              <Download size={16} /> Dışa Aktar
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-2)] py-3 text-sm font-semibold"
            >
              <Upload size={16} /> İçe Aktar
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

        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-400">
            <AlertTriangle size={16} /> Tehlikeli Bölge
          </div>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            Yanlışlıkla eklenen kayıtları temizlemek için bu profildeki tüm verileri sıfırlayabilirsin. Programların,
            antrenman geçmişin ve kilo kayıtların kalıcı olarak silinir. Hareket kütüphanesi etkilenmez.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="mb-3 w-full rounded-xl bg-red-500/15 py-3 text-center text-sm font-semibold text-red-400 disabled:opacity-50"
          >
            {resetting ? 'Sıfırlanıyor...' : 'Bu Profildeki Tüm Verileri Sıfırla'}
          </button>
          <button
            onClick={handleDeleteProfile}
            className="w-full rounded-xl border border-red-500/30 py-3 text-center text-sm font-semibold text-red-400"
          >
            Bu Profili Sil
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
    </div>
  )
}
