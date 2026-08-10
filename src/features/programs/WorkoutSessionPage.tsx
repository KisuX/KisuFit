import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, SkipForward, Trash2, Play, Pause } from 'lucide-react'
import confetti from 'canvas-confetti'
import { db, newId } from '../../db/db'
import { EXERCISES } from '../../data/exercises'
import { NumberStepper } from '../../components/common/NumberStepper'
import { MuscleDiagram } from '../../components/common/MuscleDiagram'
import { useRestTimer } from '../../hooks/useRestTimer'
import { getLastSetPerformance, evaluatePersonalRecord, getPersonalRecord, type PersonalRecord } from '../../utils/workout'
import { formatRest } from '../../utils/format'
import type { PRType, ProgramExercise } from '../../types'

type Phase = 'active' | 'celebrating' | 'resting'

export function WorkoutSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const session = useLiveQuery(() => (sessionId ? db.workoutSessions.get(sessionId) : undefined), [sessionId])
  const programExercises = useLiveQuery(async () => {
    if (!session) return [] as ProgramExercise[]
    return db.programExercises.where('programId').equals(session.programId).sortBy('order')
  }, [session?.programId])

  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [setIndex, setSetIndex] = useState(0)
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(20)
  const [phase, setPhase] = useState<Phase>('active')
  const [elapsed, setElapsed] = useState(0)
  const [prType, setPrType] = useState<PRType>(null)
  const [personalRecord, setPersonalRecord] = useState<PersonalRecord | null>(null)
  const [cardioSeconds, setCardioSeconds] = useState(0)
  const [cardioRunning, setCardioRunning] = useState(false)
  const [inclineValue, setInclineValue] = useState(0)

  const current = programExercises?.[exerciseIndex]
  const currentExercise = current ? EXERCISES.find((e) => e.id === current.exerciseId) : undefined
  const isCardio = currentExercise?.muscleGroup === 'Kardiyo'
  const effectiveSets = isCardio ? 1 : (current?.sets ?? 1)
  const nextExercise = programExercises?.[exerciseIndex + 1]
    ? EXERCISES.find((e) => e.id === programExercises[exerciseIndex + 1].exerciseId)
    : undefined

  const restTimer = useRestTimer(() => advance())

  // elapsed session timer
  useEffect(() => {
    if (!session) return
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - session.startedAt) / 1000)), 1000)
    return () => clearInterval(t)
  }, [session])

  // cardio stopwatch ticker
  useEffect(() => {
    if (!cardioRunning) return
    const t = setInterval(() => setCardioSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [cardioRunning])

  // load suggested reps/weight + personal record (or reset the cardio stopwatch) whenever we move to a new set
  useEffect(() => {
    if (!current) return
    let cancelled = false

    if (isCardio) {
      setCardioSeconds(0)
      setCardioRunning(false)
      setInclineValue(0)
      setPersonalRecord(null)
    } else {
      getLastSetPerformance(current.exerciseId, setIndex + 1).then((suggestion) => {
        if (cancelled) return
        setReps(suggestion?.reps ?? current.reps)
        setWeight(suggestion?.weight ?? current.weight)
      })
      getPersonalRecord(current.exerciseId).then((pr) => {
        if (!cancelled) setPersonalRecord(pr)
      })
    }

    return () => {
      cancelled = true
    }
  }, [current, setIndex, isCardio])

  async function deleteRecord() {
    if (!personalRecord) return
    const ok = window.confirm('Bu rekor kaydını silmek istediğine emin misin?')
    if (!ok || !current) return
    await db.setLogs.delete(personalRecord.id)
    setPersonalRecord(await getPersonalRecord(current.exerciseId))
  }

  const totalExercises = programExercises?.length ?? 0
  const isVeryLastSet = setIndex + 1 >= effectiveSets && exerciseIndex + 1 >= totalExercises

  async function finishSet() {
    if (!current || !currentExercise || !sessionId) return

    let isPR = false
    let type: PRType = null

    if (isCardio) {
      setCardioRunning(false)
      await db.setLogs.add({
        id: newId(),
        sessionId,
        exerciseId: current.exerciseId,
        exerciseName: currentExercise.name,
        setNumber: 1,
        reps: 0,
        weight: 0,
        isPR: false,
        prType: null,
        durationSeconds: cardioSeconds,
        incline: currentExercise.supportsIncline ? inclineValue : null,
        completedAt: Date.now(),
      })
    } else {
      const result = await evaluatePersonalRecord(current.exerciseId, weight, reps)
      isPR = result.isWeightPR || result.isRepPR
      type = result.isWeightPR && result.isRepPR ? 'both' : result.isWeightPR ? 'weight' : result.isRepPR ? 'reps' : null
      await db.setLogs.add({
        id: newId(),
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

    // kardiyo hareketlerinin öncesinde ve sonrasında dinlenme yok
    const movingToNextExercise = setIndex + 1 >= effectiveSets
    const upcomingExercise = movingToNextExercise
      ? programExercises?.[exerciseIndex + 1]
        ? EXERCISES.find((e) => e.id === programExercises[exerciseIndex + 1].exerciseId)
        : undefined
      : currentExercise
    const skipRest = isCardio || upcomingExercise?.muscleGroup === 'Kardiyo'

    const proceed = () => {
      if (isVeryLastSet) {
        finishWorkout()
      } else if (skipRest) {
        advance()
      } else {
        setPhase('resting')
        restTimer.start(current.restSeconds)
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

  async function advance() {
    if (!current || !programExercises) return
    setPhase('active')
    if (setIndex + 1 < effectiveSets) {
      setSetIndex((s) => s + 1)
      return
    }
    if (exerciseIndex + 1 < programExercises.length) {
      setExerciseIndex((i) => i + 1)
      setSetIndex(0)
      return
    }
    await finishWorkout()
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
    const ok = window.confirm('Antrenmandan çıkmak istediğine emin misin? Bu antrenman kaydedilmeyecek.')
    if (ok) navigate('/programlar', { replace: true })
  }

  const progressLabel = useMemo(() => {
    if (!totalExercises) return ''
    return `Hareket ${exerciseIndex + 1}/${totalExercises}`
  }, [exerciseIndex, totalExercises])

  if (session === undefined || programExercises === undefined) return null
  if (!session || !current || !currentExercise) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">Antrenman bulunamadı.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleExit}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] active:bg-[var(--color-surface)]"
          aria-label="Çık"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="text-xs font-medium text-[var(--color-muted)]">{progressLabel}</div>
          <div className="text-sm font-semibold tabular-nums">{formatRest(elapsed)}</div>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex flex-1 flex-col items-center px-5 pt-4 text-center">
        <div className="mb-1 text-xs font-medium tracking-wide text-[var(--color-accent)] uppercase">
          {currentExercise.muscleGroup}
        </div>
        <h1 className="text-2xl font-bold leading-tight">{currentExercise.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {isCardio ? `Hedef: ${formatRest(current.durationSeconds)}` : `Set ${setIndex + 1} / ${effectiveSets}`}
        </p>

        <div className="mt-4 flex items-center justify-center rounded-2xl bg-white p-3">
          <MuscleDiagram muscleGroup={currentExercise.muscleGroup} tone="light" className="h-32 w-20" />
        </div>

        {isCardio ? (
          <div className="mt-6 flex w-full flex-col items-center gap-5">
            <div className="text-6xl font-bold tabular-nums">{formatRest(cardioSeconds)}</div>
            <button
              onClick={() => setCardioRunning((r) => !r)}
              className={`flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold ${
                cardioRunning ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]' : 'bg-[var(--color-accent)] text-white'
              }`}
            >
              {cardioRunning ? <Pause size={20} /> : <Play size={20} />}
              {cardioRunning ? 'Durdur' : 'Başlat'}
            </button>
            {currentExercise.supportsIncline && (
              <NumberStepper
                label="Eğim (%)"
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
              <NumberStepper label="Tekrar" value={reps} min={0} onChange={setReps} size="lg" />
              <NumberStepper label="Kilo (kg)" value={weight} min={0} step={2.5} onChange={setWeight} size="lg" />
            </div>

            {personalRecord && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <Trophy size={13} className="text-[var(--color-gold)]" />
                <span>
                  Kişisel Rekor:{' '}
                  <span className="font-semibold text-[var(--color-text)]">
                    {personalRecord.reps} tekrar × {personalRecord.weight} kg
                  </span>
                </span>
                <button
                  onClick={deleteRecord}
                  aria-label="Rekor kaydını sil"
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
          {isCardio ? 'Hareketi Bitir' : 'Seti Bitir'}
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
                ? 'Kilo ve Tekrar Rekoru!'
                : prType === 'weight'
                  ? 'Kişisel Kilo Rekoru!'
                  : 'Kişisel Tekrar Rekoru!'}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {currentExercise.name} · {reps} tekrar · {weight} kg
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
            <p className="text-sm font-medium tracking-wide text-[var(--color-muted)] uppercase">Dinlenme</p>
            <div className="my-6 text-7xl font-bold tabular-nums">
              {restTimer.secondsLeft !== null ? formatRest(restTimer.secondsLeft) : '0:00'}
            </div>
            {setIndex + 1 < effectiveSets ? (
              <p className="text-sm text-[var(--color-muted)]">
                Sıradaki: <span className="text-[var(--color-text)]">{setIndex + 2}. Set</span>
              </p>
            ) : (
              nextExercise && (
                <p className="text-sm text-[var(--color-muted)]">
                  Sıradaki: <span className="text-[var(--color-text)]">{nextExercise.name}</span>
                </p>
              )
            )}
            <button
              onClick={restTimer.skip}
              className="mt-10 flex items-center gap-2.5 rounded-full bg-[var(--color-surface)] px-7 py-3.5 text-base font-semibold"
            >
              <SkipForward size={20} /> Atla
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
