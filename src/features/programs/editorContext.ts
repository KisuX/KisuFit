import type { ExerciseConfig } from './ExerciseCard'
import { EXERCISES } from '../../data/exercises'

export const DEFAULT_EXERCISE_CONFIG = { sets: 3, reps: 10, weight: 20, restSeconds: 90, durationSeconds: 0, incline: null }
export const DEFAULT_CARDIO_CONFIG = { sets: 1, reps: 0, weight: 0, restSeconds: 0, durationSeconds: 1200, incline: null }

/** Program oluşturma/düzenleme akışı boyunca picker ↔ editor arasında taşınan durum. */
export interface EditorContext {
  programId?: string
  name: string
  configs: ExerciseConfig[]
}

function defaultConfigFor(exerciseId: string): ExerciseConfig {
  const exercise = EXERCISES.find((e) => e.id === exerciseId)
  if (exercise?.muscleGroup === 'Kardiyo') {
    return { exerciseId, ...DEFAULT_CARDIO_CONFIG, incline: exercise.supportsIncline ? 0 : null }
  }
  return { exerciseId, ...DEFAULT_EXERCISE_CONFIG }
}

/** Önceki config'leri seçili id listesiyle birleştirir: kalanlar korunur, yeniler varsayılanla eklenir. */
export function mergeConfigs(prevConfigs: ExerciseConfig[], selectedIds: string[]): ExerciseConfig[] {
  const kept = prevConfigs.filter((c) => selectedIds.includes(c.exerciseId))
  const keptIds = new Set(kept.map((c) => c.exerciseId))
  const added = selectedIds.filter((id) => !keptIds.has(id)).map(defaultConfigFor)
  return [...kept, ...added]
}
