import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { resetAllData } from '../../db/db'

export function SettingsPage() {
  const navigate = useNavigate()
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    const ok = window.confirm(
      'Tüm programlar, antrenman geçmişi, kilo kayıtların ve hedefin kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?',
    )
    if (!ok || resetting) return
    setResetting(true)
    await resetAllData()
    setResetting(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Ayarlar" />

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-400">
            <AlertTriangle size={16} /> Tehlikeli Bölge
          </div>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            Yanlışlıkla eklenen kayıtları temizlemek için tüm verileri sıfırlayabilirsin. Programların, antrenman
            geçmişin ve kilo kayıtların kalıcı olarak silinir. Hareket kütüphanesi etkilenmez.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="w-full rounded-xl bg-red-500/15 py-3 text-center text-sm font-semibold text-red-400 disabled:opacity-50"
          >
            {resetting ? 'Sıfırlanıyor...' : 'Tüm Verileri Sıfırla'}
          </button>
        </div>
      </div>
    </div>
  )
}
