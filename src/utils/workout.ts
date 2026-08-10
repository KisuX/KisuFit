import { db } from '../db/db'

export interface SuggestedSet {
  reps: number
  weight: number
}

/** En son bu set numarasında bu hareket için yapılan performansı döner (varsa). */
export async function getLastSetPerformance(
  exerciseId: string,
  setNumber: number,
): Promise<SuggestedSet | null> {
  const logs = await db.setLogs.where('exerciseId').equals(exerciseId).toArray()
  const matching = logs.filter((l) => l.setNumber === setNumber)
  if (matching.length === 0) return null
  matching.sort((a, b) => b.completedAt - a.completedAt)
  return { reps: matching[0].reps, weight: matching[0].weight }
}

export interface PrResult {
  isWeightPR: boolean
  isRepPR: boolean
}

/**
 * Kilo rekoru: bu hareket için daha önce kaldırılmış en yüksek ağırlığı geçmek.
 * Tekrar rekoru: bu ağırlıkta veya üstünde daha önce yapılmış en yüksek tekrarı geçmek.
 * İlk kayıt için (geçmiş yoksa) rekor sayılmaz, sadece taban oluşturur.
 */
export async function evaluatePersonalRecord(
  exerciseId: string,
  weight: number,
  reps: number,
): Promise<PrResult> {
  const logs = await db.setLogs.where('exerciseId').equals(exerciseId).toArray()
  if (logs.length === 0) return { isWeightPR: false, isRepPR: false }

  const maxWeight = Math.max(...logs.map((l) => l.weight))
  const isWeightPR = weight > maxWeight

  const relevant = logs.filter((l) => l.weight >= weight)
  const isRepPR = relevant.length > 0 && reps > Math.max(...relevant.map((l) => l.reps))

  return { isWeightPR, isRepPR }
}

export interface PersonalRecord {
  id: string
  reps: number
  weight: number
}

/** Bu hareket için o ana kadarki en iyi set (en yüksek ağırlık, eşitlikte en yüksek tekrar). */
export async function getPersonalRecord(exerciseId: string): Promise<PersonalRecord | null> {
  const logs = await db.setLogs.where('exerciseId').equals(exerciseId).toArray()
  if (logs.length === 0) return null
  let best = logs[0]
  for (const l of logs) {
    if (l.weight > best.weight || (l.weight === best.weight && l.reps > best.reps)) best = l
  }
  return { id: best.id, reps: best.reps, weight: best.weight }
}

export interface SessionStats {
  durationSec: number
  totalSets: number
  totalVolume: number
  prCount: number
  prExerciseNames: string[]
}

export async function computeSessionStats(sessionId: string, durationSec: number): Promise<SessionStats> {
  const logs = await db.setLogs.where('sessionId').equals(sessionId).toArray()
  const totalVolume = logs.reduce((sum, l) => sum + l.reps * l.weight, 0)
  const prLogs = logs.filter((l) => l.isPR)
  return {
    durationSec,
    totalSets: logs.length,
    totalVolume,
    prCount: prLogs.length,
    prExerciseNames: [...new Set(prLogs.map((l) => l.exerciseName))],
  }
}
