import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Scale, Flame, Settings } from 'lucide-react'
import { db, settingKey } from '../../db/db'
import { computeSessionStats } from '../../utils/workout'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { useUnitSystem } from '../../hooks/useUnitSystem'
import { RecentWorkoutCard } from './RecentWorkoutCard'
import { WeightTrendMini } from './WeightTrendMini'

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d.getTime()
}

/** Bugünden geriye, aradan gün kaçırmadan kaç gün üst üste antrenman yapılmış (bugün henüz yapılmadıysa dünden başlar). */
function computeStreak(workoutDays: Set<string>): number {
  const cursor = new Date()
  if (!workoutDays.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (workoutDays.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function lastSevenDays(workoutDays: Set<string>): { date: Date; worked: boolean }[] {
  const days: { date: Date; worked: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ date: d, worked: workoutDays.has(d.toDateString()) })
  }
  return days
}

export function HomePage() {
  const navigate = useNavigate()
  const { profileId } = useProfile()
  const { t, locale } = useLanguage()
  const { label: unitLabel, toDisplay } = useUnitSystem()

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

    const workoutDays = new Set(finishedSessions.map((s) => new Date(s.finishedAt!).toDateString()))
    const streak = computeStreak(workoutDays)
    const last7 = lastSevenDays(workoutDays)

    const weightEntries = await db.bodyWeightEntries.where('profileId').equals(profileId).sortBy('date')
    const goalSetting = await db.settings.get(settingKey(profileId, 'goalWeight'))
    const goal = goalSetting ? parseFloat(goalSetting.value) : null
    const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null
    const remaining = currentWeight !== null && goal ? Math.abs(currentWeight - goal) : null

    return { weeklyCount, lastSession, lastStats, weightEntries, currentWeight, remaining, streak, last7 }
  }, [profileId])

  const hasAnyData = data && (data.lastSession || data.weightEntries.length > 0)

  function greeting() {
    const h = new Date().getHours()
    if (h < 12) return t('home.greetingMorning')
    if (h < 18) return t('home.greetingAfternoon')
    return t('home.greetingEvening')
  }

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting()}</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/ayarlar')}
          aria-label={t('home.settingsLabel')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-muted)] active:opacity-80"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <Flame size={18} className="mb-2 text-[var(--color-accent)]" />
          <div className="text-xl font-bold">{data?.weeklyCount ?? 0}</div>
          <div className="text-xs text-[var(--color-muted)]">{t('home.thisWeekWorkouts')}</div>
        </div>
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <Scale size={18} className="mb-2 text-[var(--color-accent)]" />
          <div className="text-xl font-bold">
            {data?.currentWeight !== null && data?.currentWeight !== undefined ? toDisplay(data.currentWeight) : '–'} {unitLabel}
          </div>
          <div className="text-xs text-[var(--color-muted)]">
            {data?.remaining !== null && data?.remaining !== undefined
              ? t('home.remainingToGoal', { value: toDisplay(data.remaining).toFixed(1), unit: unitLabel })
              : t('home.currentWeight')}
          </div>
        </div>
      </div>

      {data && data.lastSession && (
        <div className="mb-5 rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">{t('home.streakTitle')}</span>
            {data.streak > 0 ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)]">
                <Flame size={14} /> {t('home.streakDays', { count: data.streak })}
              </span>
            ) : (
              <span className="text-xs text-[var(--color-muted)]">{t('home.streakEmpty')}</span>
            )}
          </div>
          <div className="flex justify-between gap-1.5">
            {data.last7.map(({ date, worked }, i) => (
              <div
                key={i}
                className={`flex h-8 flex-1 items-center justify-center rounded-full text-[11px] font-semibold ${
                  worked ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'
                }`}
              >
                {date.getDate()}
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.lastSession && data.lastStats && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">{t('home.lastWorkout')}</span>
            <button onClick={() => navigate('/gecmis')} className="text-xs font-medium text-[var(--color-accent)]">
              {t('home.seeAllWorkouts')}
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
            <span className="text-sm font-semibold">{t('home.weightTrend')}</span>
            <button onClick={() => navigate('/kilo')} className="text-xs font-medium text-[var(--color-accent)]">
              {t('home.details')}
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
          <p className="text-sm text-[var(--color-muted)]">{t('home.emptyState')}</p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => navigate('/programlar')}
              className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white"
            >
              {t('home.createProgram')}
            </button>
            <button
              onClick={() => navigate('/kilo')}
              className="flex-1 rounded-xl bg-[var(--color-surface)] py-3 text-sm font-semibold"
            >
              {t('home.addWeight')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
