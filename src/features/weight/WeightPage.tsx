import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Target, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { db, newId } from '../../db/db'
import { WeightChart } from './WeightChart'
import { GoalWeightSheet } from './GoalWeightSheet'
import { formatDateShort, todayStr } from '../../utils/format'

export function WeightPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [dateInput, setDateInput] = useState(todayStr())

  const entries = useLiveQuery(() => db.bodyWeightEntries.orderBy('date').toArray(), []) ?? []
  const goalSetting = useLiveQuery(() => db.settings.get('goalWeight'), [])
  const goal = goalSetting ? parseFloat(goalSetting.value) : null

  const current = entries.length > 0 ? entries[entries.length - 1] : null
  const start = entries.length > 0 ? entries[0] : null
  const remaining = current && goal ? Math.abs(current.weight - goal) : null

  async function saveGoal(value: number) {
    await db.settings.put({ key: 'goalWeight', value: String(value) })
    setSheetOpen(false)
  }

  async function addEntry() {
    const num = parseFloat(weightInput.replace(',', '.'))
    if (!Number.isFinite(num) || num <= 0 || !dateInput) return
    const existing = await db.bodyWeightEntries.where('date').equals(dateInput).first()
    if (existing) {
      await db.bodyWeightEntries.update(existing.id, { weight: num })
    } else {
      await db.bodyWeightEntries.add({ id: newId(), date: dateInput, weight: num })
    }
    setWeightInput('')
  }

  async function deleteEntry(id: string) {
    const ok = window.confirm('Bu kilo kaydını silmek istediğine emin misin?')
    if (ok) await db.bodyWeightEntries.delete(id)
  }

  const sortedDesc = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kilo Takibi</h1>
          <p className="text-sm text-[var(--color-muted)]">İlerlemeni takip et</p>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-accent)] active:opacity-80"
          aria-label="Hedef kilo belirle"
        >
          <Target size={20} />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <MiniStat label="Güncel" value={current ? `${current.weight}` : '–'} />
        <MiniStat label="Başlangıç" value={start ? `${start.weight}` : '–'} />
        <MiniStat
          label="Hedefe Kalan"
          value={goal ? (remaining !== null ? `${remaining.toFixed(1)}` : '–') : 'Belirle'}
          accent={!goal}
        />
      </div>

      <WeightChart entries={entries} goal={goal} />

      <div className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4">
        <div className="mb-3 text-sm font-semibold">Kilo Ekle</div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateInput}
            max={todayStr()}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-[42%] rounded-xl bg-[var(--color-surface-2)] px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <input
            inputMode="decimal"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="kg"
            className="flex-1 rounded-xl bg-[var(--color-surface-2)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <button
            onClick={addEntry}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white"
            aria-label="Ekle"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {sortedDesc.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold">Geçmiş</div>
          <div className="flex flex-col gap-1.5">
            {sortedDesc.slice(0, 10).map((e, i) => {
              const olderEntry = sortedDesc[i + 1]
              const delta = olderEntry ? e.weight - olderEntry.weight : 0
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] px-4 py-2.5"
                >
                  <span className="text-sm text-[var(--color-muted)]">{formatDateShort(e.date)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{e.weight} kg</span>
                    {olderEntry && (
                      <span
                        className={`text-xs font-medium ${
                          delta > 0 ? 'text-[var(--color-accent)]' : delta < 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'
                        }`}
                      >
                        {delta > 0 ? '+' : ''}
                        {delta.toFixed(1)}
                      </span>
                    )}
                    <button
                      onClick={() => deleteEntry(e.id)}
                      aria-label="Kaydı sil"
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

      <AnimatePresence>
        {sheetOpen && (
          <GoalWeightSheet initialValue={goal} onSave={saveGoal} onClose={() => setSheetOpen(false)} />
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
