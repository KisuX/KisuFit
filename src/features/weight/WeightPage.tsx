import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Target, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { db, newId, settingKey } from '../../db/db'
import { WeightChart } from './WeightChart'
import { GoalWeightSheet } from './GoalWeightSheet'
import { BodyMeasurementsSection } from './BodyMeasurementsSection'
import { formatDateShort, todayStr } from '../../utils/format'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { useUnitSystem } from '../../hooks/useUnitSystem'

type Tab = 'weight' | 'measurements'

export function WeightPage() {
  const { profileId } = useProfile()
  const { t, locale } = useLanguage()
  const { label: unitLabel, toDisplay, toKg } = useUnitSystem()
  const [tab, setTab] = useState<Tab>('weight')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [dateInput, setDateInput] = useState(todayStr())

  const entries =
    useLiveQuery(async () => {
      const rows = await db.bodyWeightEntries.where('profileId').equals(profileId).toArray()
      return rows.sort((a, b) => (a.date === b.date ? (a.createdAt ?? 0) - (b.createdAt ?? 0) : a.date < b.date ? -1 : 1))
    }, [profileId]) ?? []
  const goalSetting = useLiveQuery(() => db.settings.get(settingKey(profileId, 'goalWeight')), [profileId])
  const goal = goalSetting ? parseFloat(goalSetting.value) : null

  const current = entries.length > 0 ? entries[entries.length - 1] : null
  const start = entries.length > 0 ? entries[0] : null
  const remaining = current && goal ? Math.abs(current.weight - goal) : null

  async function saveGoal(kgValue: number) {
    await db.settings.put({ key: settingKey(profileId, 'goalWeight'), profileId, value: String(kgValue) })
    setSheetOpen(false)
  }

  async function addEntry() {
    const num = parseFloat(weightInput.replace(',', '.'))
    if (!Number.isFinite(num) || num <= 0 || !dateInput) return
    await db.bodyWeightEntries.add({ id: newId(), profileId, date: dateInput, weight: toKg(num), createdAt: Date.now() })
    setWeightInput('')
  }

  async function deleteEntry(id: string) {
    const ok = window.confirm(t('weight.deleteEntryConfirm'))
    if (ok) await db.bodyWeightEntries.delete(id)
  }

  const sortedDesc = [...entries].reverse()

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('weight.title')}</h1>
          <p className="text-sm text-[var(--color-muted)]">{t('weight.subtitle')}</p>
        </div>
        {tab === 'weight' && (
          <button
            onClick={() => setSheetOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-accent)] active:opacity-80"
            aria-label={t('weight.setGoal')}
          >
            <Target size={20} />
          </button>
        )}
      </div>

      <div className="mb-5 flex gap-2 rounded-xl bg-[var(--color-surface)] p-1">
        {(['weight', 'measurements'] as Tab[]).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === tb ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-muted)]'
            }`}
          >
            {tb === 'weight' ? t('weight.tabWeight') : t('weight.tabMeasurements')}
          </button>
        ))}
      </div>

      {tab === 'measurements' ? (
        <BodyMeasurementsSection />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <MiniStat label={t('weight.current')} value={current ? `${toDisplay(current.weight)}` : '–'} />
            <MiniStat label={t('weight.start')} value={start ? `${toDisplay(start.weight)}` : '–'} />
            <MiniStat
              label={t('weight.remainingToGoal')}
              value={goal ? (remaining !== null ? `${toDisplay(remaining).toFixed(1)}` : '–') : t('weight.setGoalShort')}
              accent={!goal}
            />
          </div>

          <WeightChart entries={entries} goal={goal} />

          <div className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4">
            <div className="mb-3 text-sm font-semibold">{t('weight.addWeight')}</div>
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
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder={unitLabel}
                  className="min-w-0 flex-1 rounded-xl bg-[var(--color-surface-2)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                <button
                  onClick={addEntry}
                  className="flex h-[42px] w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white"
                  aria-label={t('common.add')}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          {sortedDesc.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold">{t('weight.history')}</div>
              <div className="flex flex-col gap-1.5">
                {sortedDesc.slice(0, 10).map((e, i) => {
                  const olderEntry = sortedDesc[i + 1]
                  const delta = olderEntry ? toDisplay(e.weight) - toDisplay(olderEntry.weight) : 0
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] px-4 py-2.5"
                    >
                      <span className="text-sm text-[var(--color-muted)]">{formatDateShort(e.date, locale)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">
                          {toDisplay(e.weight)} {unitLabel}
                        </span>
                        {olderEntry && (
                          <span
                            className={`text-xs font-medium ${
                              delta > 0
                                ? 'text-[var(--color-accent)]'
                                : delta < 0
                                  ? 'text-[var(--color-success)]'
                                  : 'text-[var(--color-muted)]'
                            }`}
                          >
                            {delta > 0 ? '+' : ''}
                            {delta.toFixed(1)}
                          </span>
                        )}
                        <button
                          onClick={() => deleteEntry(e.id)}
                          aria-label={t('weight.deleteEntry')}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface-2)]"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {sheetOpen && (
          <GoalWeightSheet
            initialValue={goal !== null ? toDisplay(goal) : null}
            unitLabel={unitLabel}
            onSave={(displayValue) => saveGoal(toKg(displayValue))}
            onClose={() => setSheetOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-3 text-center">
      <div className={`text-lg font-bold ${accent ? 'text-[var(--color-accent)]' : ''}`}>{value}</div>
      <div className="text-[11px] text-[var(--color-muted)]">{label}</div>
    </div>
  )
}
