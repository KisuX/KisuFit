import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Scale, Flame, Settings } from 'lucide-react'
import { db, settingKey } from '../../db/db'
import { computeSessionStats } from '../../utils/workout'
import { useProfile } from '../../context/ProfileContext'
import { RecentWorkoutCard } from './RecentWorkoutCard'
import { WeightTrendMini } from './WeightTrendMini'

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d.getTime()
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

export function HomePage() {
  const navigate = useNavigate()
  const { profileId } = useProfile()

  const data = useLiveQuery(async () => {
    const weekStart = startOfWeek(new Date())
    const finishedSessions = await db.workoutSessions
      .where('profileId')
      .equals(profileId)
      .filter((s) => s.finishedAt !== null)
      .toArray()
    finishedSessions.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
    const weeklyCount = finishedSessions.filter((s) => (s.finishedAt ?? 0) >= weekStart).length
    const lastSession = finishedSessions[0] ?? null
    const lastStats = lastSession ? await computeSessionStats(lastSession.id, lastSession.durationSec) : null

    const weightEntries = await db.bodyWeightEntries.where('profileId').equals(profileId).sortBy('date')
    const goalSetting = await db.settings.get(settingKey(profileId, 'goalWeight'))
    const goal = goalSetting ? parseFloat(goalSetting.value) : null
    const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null
    const remaining = currentWeight !== null && goal ? Math.abs(currentWeight - goal) : null

    return { weeklyCount, lastSession, lastStats, weightEntries, currentWeight, remaining }
  }, [profileId])

  const hasAnyData = data && (data.lastSession || data.weightEntries.length > 0)

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting()}</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/ayarlar')}
          aria-label="Ayarlar"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-muted)] active:opacity-80"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <Flame size={18} className="mb-2 text-[var(--color-accent)]" />
          <div className="text-xl font-bold">{data?.weeklyCount ?? 0}</div>
          <div className="text-xs text-[var(--color-muted)]">bu hafta antrenman</div>
        </div>
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <Scale size={18} className="mb-2 text-[var(--color-accent)]" />
          <div className="text-xl font-bold">{data?.currentWeight ?? '–'} kg</div>
          <div className="text-xs text-[var(--color-muted)]">
            {data?.remaining !== null && data?.remaining !== undefined
              ? `hedefe ${data.remaining.toFixed(1)} kg kaldı`
              : 'güncel kilo'}
          </div>
        </div>
      </div>

      {data?.lastSession && data.lastStats && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Son Antrenman</span>
            <button onClick={() => navigate('/gecmis')} className="text-xs font-medium text-[var(--color-accent)]">
              Tüm Antrenmanları Gör
            </button>
          </div>
          <RecentWorkoutCard
            session={data.lastSession}
            totalSets={data.lastStats.totalSets}
            totalVolume={data.lastStats.totalVolume}
            onClick={() => navigate(`/gecmis/${data.lastSession!.id}`)}
          />
        </div>
      )}

      {data && data.weightEntries.length > 0 && (
        <div className="mb-5 rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Kilo Trendi</span>
            <button onClick={() => navigate('/kilo')} className="text-xs font-medium text-[var(--color-accent)]">
              Detaylar
            </button>
          </div>
          <WeightTrendMini entries={data.weightEntries} />
        </div>
      )}

      {data && !hasAnyData && (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]">
            <Dumbbell size={28} className="text-[var(--color-muted)]" />
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            Henüz veri yok. Bir program oluşturarak veya kilonu ekleyerek başla.
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => navigate('/programlar')}
              className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white"
            >
              Program Oluştur
            </button>
            <button
              onClick={() => navigate('/kilo')}
              className="flex-1 rounded-xl bg-[var(--color-surface)] py-3 text-sm font-semibold"
            >
              Kilo Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
