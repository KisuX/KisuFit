import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, SkipForward, Trash2, Play, Pause, Menu, AlarmClock } from 'lucide-react'
import confetti from 'canvas-confetti'
import { db, newId } from '../../db/db'
import { useAllExercises } from '../../hooks/useAllExercises'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage, translateMuscleGroup } from '../../i18n/LanguageContext'
import { NumberStepper } from '../../components/common/NumberStepper'
import { ExerciseSwitcherSheet } from './ExerciseSwitcherSheet'
import { useRestTimer } from '../../hooks/useRestTimer'
import { useNotificationsEnabled } from '../../hooks/useNotificationsEnabled'
import { useUnitSystem } from '../../hooks/useUnitSystem'
import { getLastSetPerformance, evaluatePersonalRecord, getPersonalRecord, type PersonalRecord } from '../../utils/workout'
import { formatRest } from '../../utils/format'
import { notify } from '../../utils/notifications'
import { playChime, primeAudio } from '../../utils/sound'
import type { Exercise, PRType, ProgramExercise } from '../../types'

type Phase = 'active' | 'celebrating' | 'resting'

function exerciseSets(pe: ProgramExercise, exercise: Exercise | undefined) {
  return exercise?.muscleGroup === 'Kardiyo' ? 1 : pe.sets
}

/** Sıradaki henüz tamamlanmamış hareketi programdaki sıraya göre (baştan sararak) bulur. */
function findNextIncompleteIndex(
  fromIndex: number,
  list: ProgramExercise[],
  completed: Record<string, number>,
  exercises: Exercise[],
): number | null {
  const n = list.length
  for (let offset = 1; offset <= n; offset++) {
    const idx = (fromIndex + offset) % n
    const pe = list[idx]
    const exercise = exercises.find((e) => e.id === pe.exerciseId)
    if ((completed[pe.id] ?? 0) < exerciseSets(pe, exercise)) return idx
  }
  return null
}

/** idx'in içinde bulunduğu süper set grubunun [start, end] aralığını (programExercises index'i) döner. */
function groupRange(idx: number, list: ProgramExercise[]): { start: number; end: number } {
  let start = idx
  while (start > 0 && list[start - 1].linkedToNext) start--
  let end = idx
  while (end < list.length - 1 && list[end].linkedToNext) end++
  return { start, end }
}

export function WorkoutSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const allExercises = useAllExercises()
  const { profileId } = useProfile()
  const { t, language } = useLanguage()
  const notificationsEnabled = useNotificationsEnabled()
  const { label: unitLabel, toDisplay, toKg, step: weightStep } = useUnitSystem()

  const session = useLiveQuery(async () => {
    if (!sessionId) return undefined
    const s = await db.workoutSessions.get(sessionId)
    return s && s.profileId === profileId ? s : undefined
  }, [sessionId, profileId])
  const programExercises = useLiveQuery(async () => {
    if (!session) return [] as ProgramExercise[]
    return db.programExercises.where('programId').equals(session.programId).sortBy('order')
  }, [session?.programId])

  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({})
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(20)
  const [phase, setPhase] = useState<Phase>('active')
  const [elapsed, setElapsed] = useState(0)
  const [prType, setPrType] = useState<PRType>(null)
  const [personalRecord, setPersonalRecord] = useState<PersonalRecord | null>(null)
  const [cardioSeconds, setCardioSeconds] = useState(0)
  const [cardioRunning, setCardioRunning] = useState(false)
  const [inclineValue, setInclineValue] = useState(0)
  const [timeUpFlash, setTimeUpFlash] = useState(false)
  const [restNextLabel, setRestNextLabel] = useState('')
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const timeUpAlerted = useRef(false)
  const cardioAccumulatedRef = useRef(0)
  const cardioRunStartRef = useRef<number | null>(null)

  const current = programExercises?.[exerciseIndex]
  const currentExercise = current ? allExercises.find((e) => e.id === current.exerciseId) : undefined
  const isCardio = currentExercise?.muscleGroup === 'Kardiyo'
  const effectiveSets = current ? exerciseSets(current, currentExercise) : 1
  const setIndex = current ? (completedSets[current.id] ?? 0) : 0
  const cardioTarget = current?.durationSeconds ?? 0
  const cardioOvertime = isCardio && cardioSeconds >= cardioTarget

  function advance(completedOverride?: Record<string, number>) {
    if (!current || !programExercises) return
    setPhase('active')
    const completed = completedOverride ?? completedSets
    const doneCount = completed[current.id] ?? 0
    if (doneCount < effectiveSets) return
    const nextIdx = findNextIncompleteIndex(exerciseIndex, programExercises, completed, allExercises)
    if (nextIdx === null) {
      finishWorkout()
      return
    }
    setExerciseIndex(nextIdx)
  }

  const restTimer = useRestTimer((wasSkipped) => {
    if (!wasSkipped) {
      playChime()
      if ('vibrate' in navigator) navigator.vibrate(200)
      if (notificationsEnabled) notify(t('workout.restDoneNotification'), restNextLabel || undefined)
    }
    advance()
  })

  // elapsed session timer - Date.now() farkından hesaplanır, sekme arkaplandan dönünce anında güncellenir
  useEffect(() => {
    if (!session) return
    const sync = () => setElapsed(Math.floor((Date.now() - session.startedAt) / 1000))
    const t = setInterval(sync, 1000)
    document.addEventListener('visibilitychange', sync)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [session])

  // cardio kronometresi: biriken süre + (çalışıyorsa) o anki segmentin başlangıcından geçen gerçek süre.
  // Sekme arkaplandayken setInterval yavaşlatılsa bile, geri dönüldüğünde doğru değer anında hesaplanır.
  function syncCardio() {
    const runElapsed = cardioRunStartRef.current !== null ? Math.floor((Date.now() - cardioRunStartRef.current) / 1000) : 0
    setCardioSeconds(cardioAccumulatedRef.current + runElapsed)
  }

  useEffect(() => {
    if (!cardioRunning) return
    const t = setInterval(syncCardio, 1000)
    document.addEventListener('visibilitychange', syncCardio)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', syncCardio)
    }
  }, [cardioRunning])

  function toggleCardioRunning() {
    primeAudio()
    if (cardioRunning) {
      if (cardioRunStartRef.current !== null) {
        cardioAccumulatedRef.current += Math.floor((Date.now() - cardioRunStartRef.current) / 1000)
      }
      cardioRunStartRef.current = null
      syncCardio()
    } else {
      cardioRunStartRef.current = Date.now()
    }
    setCardioRunning((r) => !r)
  }

  // hedef kardiyo süresine ulaşılınca bir kere uyar, sonra fazladan geçen süreyi saymaya devam et
  useEffect(() => {
    if (!isCardio || cardioTarget <= 0) return
    if (cardioSeconds >= cardioTarget && !timeUpAlerted.current) {
      timeUpAlerted.current = true
      setTimeUpFlash(true)
      playChime()
      if ('vibrate' in navigator) navigator.vibrate(200)
      if (notificationsEnabled) notify(t('workout.cardioTargetNotification'), currentExercise?.name)
      setTimeout(() => setTimeUpFlash(false), 2500)
    }
  }, [cardioSeconds, cardioTarget, isCardio, notificationsEnabled, t, currentExercise])

  // load suggested reps/weight + personal record (or reset the cardio stopwatch) whenever we move to a new set
  useEffect(() => {
    if (!current) return
    let cancelled = false

    if (isCardio) {
      cardioAccumulatedRef.current = 0
      cardioRunStartRef.current = null
      setCardioSeconds(0)
      setCardioRunning(false)
      setInclineValue(0)
      setPersonalRecord(null)
      timeUpAlerted.current = false
    } else {
      getLastSetPerformance(profileId, current.exerciseId, setIndex + 1).then((suggestion) => {
        if (cancelled) return
        setReps(suggestion?.reps ?? current.reps)
        setWeight(suggestion?.weight ?? current.weight)
      })
      getPersonalRecord(profileId, current.exerciseId).then((pr) => {
        if (!cancelled) setPersonalRecord(pr)
      })
    }

    return () => {
      cancelled = true
    }
  }, [current, setIndex, isCardio, profileId])

  async function deleteRecord() {
    if (!personalRecord) return
    const ok = window.confirm(t('workout.deleteRecordConfirm'))
    if (!ok || !current) return
    await db.setLogs.delete(personalRecord.id)
    setPersonalRecord(await getPersonalRecord(profileId, current.exerciseId))
  }

  const totalExercises = programExercises?.length ?? 0

  async function finishSet() {
    if (!current || !currentExercise || !sessionId || !programExercises) return
    primeAudio()

    let isPR = false
    let type: PRType = null

    if (isCardio) {
      const finalCardioSeconds =
        cardioRunStartRef.current !== null
          ? cardioAccumulatedRef.current + Math.floor((Date.now() - cardioRunStartRef.current) / 1000)
          : cardioSeconds
      setCardioRunning(false)
      await db.setLogs.add({
        id: newId(),
        profileId,
        sessionId,
        exerciseId: current.exerciseId,
        exerciseName: currentExercise.name,
        setNumber: 1,
        reps: 0,
        weight: 0,
        isPR: false,
        prType: null,
        durationSeconds: finalCardioSeconds,
        incline: currentExercise.supportsIncline ? inclineValue : null,
        completedAt: Date.now(),
      })
    } else {
      const result = await evaluatePersonalRecord(profileId, current.exerciseId, weight, reps)
      isPR = result.isWeightPR || result.isRepPR
      type = result.isWeightPR && result.isRepPR ? 'both' : result.isWeightPR ? 'weight' : result.isRepPR ? 'reps' : null
      await db.setLogs.add({
        id: newId(),
        profileId,
        sessionId,
        exerciseId: current.exerciseId,
        exerciseName: currentExercise.name,
        setNumber: setIndex + 1,
        reps,
        weight,
        isPR,
        prType: type,
        durationSeconds: null,
        incline: null,
        completedAt: Date.now(),
      })
    }

    const newCompleted = { ...completedSets, [current.id]: (completedSets[current.id] ?? 0) + 1 }
    setCompletedSets(newCompleted)

    const { start: groupStart, end: groupEnd } = groupRange(exerciseIndex, programExercises)
    const isGrouped = groupEnd > groupStart

    function memberHasRemaining(k: number) {
      const pe = programExercises![k]
      const ex = allExercises.find((e) => e.id === pe.exerciseId)
      return (newCompleted[pe.id] ?? 0) < exerciseSets(pe, ex)
    }

    const doneCount = newCompleted[current.id] ?? 0
    const willMoveOn = doneCount >= effectiveSets

    const proceed = () => {
      if (isGrouped) {
        // önce grubun bu turdaki bir sonraki üyesine bak (aralarında dinlenme yok), yoksa baştan sarıp eksik kalan üyeyi bul
        let groupNextIdx: number | null = null
        for (let k = exerciseIndex + 1; k <= groupEnd; k++) {
          if (memberHasRemaining(k)) {
            groupNextIdx = k
            break
          }
        }
        if (groupNextIdx === null) {
          for (let k = groupStart; k <= exerciseIndex; k++) {
            if (memberHasRemaining(k)) {
              groupNextIdx = k
              break
            }
          }
        }
        if (groupNextIdx !== null) {
          setPhase('active')
          setExerciseIndex(groupNextIdx)
          return
        }
        // grubun tamamı bitti: programdaki sıradaki harekete normal akışla geç (gerekiyorsa dinlenerek)
        const outerNextIdx = findNextIncompleteIndex(exerciseIndex, programExercises, newCompleted, allExercises)
        if (outerNextIdx === null) {
          finishWorkout()
          return
        }
        const upcoming = allExercises.find((e) => e.id === programExercises![outerNextIdx].exerciseId)
        if (isCardio || upcoming?.muscleGroup === 'Kardiyo') {
          advance(newCompleted)
        } else {
          setRestNextLabel(upcoming?.name ?? '')
          setPhase('resting')
          restTimer.start(current!.restSeconds)
        }
        return
      }

      const nextIdx = willMoveOn ? findNextIncompleteIndex(exerciseIndex, programExercises, newCompleted, allExercises) : null
      const allDone = willMoveOn && nextIdx === null
      const upcomingExercise = willMoveOn
        ? nextIdx !== null
          ? allExercises.find((e) => e.id === programExercises![nextIdx].exerciseId)
          : undefined
        : currentExercise
      // kardiyo hareketlerinin öncesinde ve sonrasında dinlenme yok
      const skipRest = isCardio || upcomingExercise?.muscleGroup === 'Kardiyo'

      if (allDone) {
        finishWorkout()
      } else if (skipRest) {
        advance(newCompleted)
      } else {
        setRestNextLabel(willMoveOn ? (upcomingExercise?.name ?? '') : t('workout.nextSet', { n: doneCount + 1 }))
        setPhase('resting')
        restTimer.start(current!.restSeconds)
      }
    }

    if (isPR) {
      setPrType(type)
      setPhase('celebrating')
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 }, colors: ['#ff6a3d', '#facc15', '#4ade80'] })
      setTimeout(proceed, 1600)
    } else {
      proceed()
    }
  }

  async function finishWorkout() {
    if (!sessionId || !session) return
    const finishedAt = Date.now()
    await db.workoutSessions.update(sessionId, {
      finishedAt,
      durationSec: Math.floor((finishedAt - session.startedAt) / 1000),
    })
    navigate(`/antrenman/${sessionId}/ozet`, { replace: true })
  }

  function handleExit() {
    const ok = window.confirm(t('workout.exitConfirm'))
    if (ok) navigate('/programlar', { replace: true })
  }

  function jumpToExercise(idx: number) {
    if (phase !== 'active') return
    setExerciseIndex(idx)
    setSwitcherOpen(false)
  }

  const progressLabel = useMemo(() => {
    if (!totalExercises) return ''
    return t('workout.exerciseProgress', { current: exerciseIndex + 1, total: totalExercises })
  }, [exerciseIndex, totalExercises, t])

  const switcherItems = useMemo(() => {
    if (!programExercises) return []
    return programExercises
      .map((pe) => ({ pe, exercise: allExercises.find((e) => e.id === pe.exerciseId) }))
      .filter((x): x is { pe: ProgramExercise; exercise: Exercise } => !!x.exercise)
  }, [programExercises, allExercises])

  if (session === undefined || programExercises === undefined) return null
  if (!session || !current || !currentExercise) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">{t('workout.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleExit}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface)]"
          aria-label={t('workout.exit')}
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="text-xs font-medium text-[var(--color-muted)]">{progressLabel}</div>
          <div className="text-sm font-semibold tabular-nums">{formatRest(elapsed)}</div>
        </div>
        <button
          onClick={() => setSwitcherOpen(true)}
          disabled={phase !== 'active'}
          aria-label={t('workout.changeExercise')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface)] disabled:opacity-40"
        >
          <Menu size={20} />
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center px-5 pt-4 text-center">
        <div className="mb-1 text-xs font-medium tracking-wide text-[var(--color-accent)] uppercase">
          {translateMuscleGroup(currentExercise.muscleGroup, language)}
        </div>
        <h1 className="text-2xl font-bold leading-tight">{currentExercise.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {isCardio
            ? t('workout.target', { value: formatRest(cardioTarget) })
            : t('workout.setProgress', { current: setIndex + 1, total: effectiveSets })}
        </p>

        {isCardio ? (
          <div className="mt-6 flex w-full flex-col items-center gap-5">
            <div>
              <div
                className={`text-6xl font-bold tabular-nums transition-colors ${
                  cardioOvertime ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'
                }`}
              >
                {cardioOvertime ? '+' : ''}
                {formatRest(cardioOvertime ? cardioSeconds - cardioTarget : cardioTarget - cardioSeconds)}
              </div>
              {timeUpFlash && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]"
                >
                  <AlarmClock size={16} /> {t('workout.timeUp')}
                </motion.p>
              )}
            </div>
            <button
              onClick={toggleCardioRunning}
              className={`flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold ${
                cardioRunning ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]' : 'bg-[var(--color-accent)] text-white'
              }`}
            >
              {cardioRunning ? <Pause size={20} /> : <Play size={20} />}
              {cardioRunning ? t('workout.stop') : t('workout.start')}
            </button>
            {currentExercise.supportsIncline && (
              <NumberStepper
                label={t('exerciseCard.incline')}
                value={inclineValue}
                min={0}
                max={15}
                step={0.5}
                formatValue={(v) => `%${v}`}
                onChange={setInclineValue}
                size="lg"
              />
            )}
          </div>
        ) : (
          <>
            <div className="mt-6 flex w-full flex-col gap-4">
              <NumberStepper label={t('exerciseCard.reps')} value={reps} min={0} onChange={setReps} size="lg" />
              <NumberStepper
                label={`${t('exerciseCard.weight')} (${unitLabel})`}
                value={toDisplay(weight)}
                min={0}
                step={weightStep}
                onChange={(v) => setWeight(toKg(v))}
                size="lg"
              />
            </div>

            {personalRecord && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <Trophy size={13} className="text-[var(--color-gold)]" />
                <button
                  onClick={() => navigate(`/hareket/${current.exerciseId}`)}
                  className="text-left underline-offset-2 hover:underline"
                >
                  {t('workout.personalRecord')}:{' '}
                  <span className="font-semibold text-[var(--color-text)]">
                    {personalRecord.reps} {t('common.reps')} × {toDisplay(personalRecord.weight)} {unitLabel}
                  </span>
                </button>
                <button
                  onClick={deleteRecord}
                  aria-label={t('workout.deleteRecord')}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface)]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </>
        )}

        <div className="flex-1" />

        <button
          onClick={finishSet}
          disabled={phase !== 'active'}
          className="w-full rounded-xl bg-[var(--color-accent)] py-4 text-center text-base font-semibold text-white disabled:opacity-40"
        >
          {isCardio ? t('workout.finishExercise') : t('workout.finishSet')}
        </button>

        {isCardio ? (
          <div className="mb-8" />
        ) : (
          <div className="mt-5 mb-8 flex w-full flex-wrap gap-1.5">
            {Array.from({ length: effectiveSets }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < setIndex ? 'bg-[var(--color-accent)]' : i === setIndex ? 'bg-[var(--color-accent)]/50' : 'bg-[var(--color-surface-2)]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {phase === 'celebrating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[var(--color-bg)]/95"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-gold)]/15"
            >
              <Trophy size={44} className="text-[var(--color-gold)]" />
            </motion.div>
            <h2 className="mt-5 text-2xl font-bold text-[var(--color-gold)]">
              {prType === 'both'
                ? t('workout.bothRecordTitle')
                : prType === 'weight'
                  ? t('workout.weightRecordTitle')
                  : t('workout.repsRecordTitle')}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {currentExercise.name} · {reps} {t('common.reps')} · {toDisplay(weight)} {unitLabel}
            </p>
          </motion.div>
        )}

        {phase === 'resting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[var(--color-bg)]"
          >
            <p className="text-sm font-medium tracking-wide text-[var(--color-muted)] uppercase">{t('workout.resting')}</p>
            <div className="my-6 text-7xl font-bold tabular-nums">
              {restTimer.secondsLeft !== null ? formatRest(restTimer.secondsLeft) : '0:00'}
            </div>
            {restNextLabel && (
              <p className="text-sm text-[var(--color-muted)]">
                {t('workout.next')} <span className="text-[var(--color-text)]">{restNextLabel}</span>
              </p>
            )}
            <button
              onClick={restTimer.skip}
              className="mt-10 flex items-center gap-2.5 rounded-full bg-[var(--color-surface)] px-7 py-3.5 text-base font-semibold"
            >
              <SkipForward size={20} /> {t('workout.skip')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {switcherOpen && (
          <ExerciseSwitcherSheet
            items={switcherItems}
            completedSets={completedSets}
            currentIndex={exerciseIndex}
            onSelect={jumpToExercise}
            onClose={() => setSwitcherOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
