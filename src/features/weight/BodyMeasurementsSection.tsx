import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2 } from 'lucide-react'
import { db, newId } from '../../db/db'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { formatDateShort, todayStr } from '../../utils/format'
import { MuscleGroupChip } from '../../components/common/MuscleGroupChip'
import { ExerciseProgressChart } from '../history/ExerciseProgressChart'
import type { MeasurementType } from '../../types'

const TYPES: MeasurementType[] = ['waist', 'chest', 'arm', 'hip', 'thigh', 'shoulder']

export function BodyMeasurementsSection() {
  const { profileId } = useProfile()
  const { t, locale } = useLanguage()
  const [type, setType] = useState<MeasurementType>('waist')
  const [valueInput, setValueInput] = useState('')
  const [dateInput, setDateInput] = useState(todayStr())

  const entries =
    useLiveQuery(async () => {
      const rows = await db.bodyMeasurements
        .where('profileId')
        .equals(profileId)
        .and((m) => m.type === type)
        .toArray()
      return rows.sort((a, b) => (a.date === b.date ? a.createdAt - b.createdAt : a.date < b.date ? -1 : 1))
    }, [profileId, type]) ?? []

  async function addEntry() {
    const num = parseFloat(valueInput.replace(',', '.'))
    if (!Number.isFinite(num) || num <= 0 || !dateInput) return
    await db.bodyMeasurements.add({ id: newId(), profileId, type, date: dateInput, value: num, createdAt: Date.now() })
    setValueInput('')
  }

  async function deleteEntry(id: string) {
    const ok = window.confirm(t('measurements.deleteConfirm'))
    if (ok) await db.bodyMeasurements.delete(id)
  }

  const points = entries.map((e) => ({ date: e.date, value: e.value }))
  const sortedDesc = [...entries].reverse()

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TYPES.map((ty) => (
          <MuscleGroupChip key={ty} label={t(`measurements.${ty}`)} active={type === ty} onClick={() => setType(ty)} />
        ))}
      </div>

      <ExerciseProgressChart points={points} unit={t('common.cm')} emptyLabel={t('measurements.chartEmpty')} />

      <div className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4">
        <div className="mb-3 text-sm font-semibold">{t('measurements.addMeasurement')}</div>
        <div className="flex flex-col gap-2">
          <input
            type="date"
            value={dateInput}
            max={todayStr()}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full rounded-xl bg-[var(--color-surface-2)] px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <div className="flex gap-2">
            <input
              inputMode="decimal"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder={t('measurements.cmPlaceholder')}
              className="min-w-0 flex-1 rounded-xl bg-[var(--color-surface-2)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            <button
              onClick={addEntry}
              aria-label={t('common.add')}
              className="flex h-[42px] w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {sortedDesc.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold">{t('measurements.history')}</div>
          <div className="flex flex-col gap-1.5">
            {sortedDesc.slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] px-4 py-2.5">
                <span className="text-sm text-[var(--color-muted)]">{formatDateShort(e.date, locale)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {e.value} {t('common.cm')}
                  </span>
                  <button
                    onClick={() => deleteEntry(e.id)}
                    aria-label={t('measurements.deleteEntry')}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface-2)]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {sortedDesc.length === 0 && (
        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">{t('measurements.emptyState')}</p>
      )}
    </div>
  )
}
