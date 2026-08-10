import Dexie, { type EntityTable } from 'dexie'
import type {
  BodyWeightEntry,
  Exercise,
  Program,
  ProgramExercise,
  SetLog,
  Settings,
  WorkoutSession,
} from '../types'
import { EXERCISES } from '../data/exercises'

export const db = new Dexie('kisufit') as Dexie & {
  exercises: EntityTable<Exercise, 'id'>
  programs: EntityTable<Program, 'id'>
  programExercises: EntityTable<ProgramExercise, 'id'>
  workoutSessions: EntityTable<WorkoutSession, 'id'>
  setLogs: EntityTable<SetLog, 'id'>
  bodyWeightEntries: EntityTable<BodyWeightEntry, 'id'>
  settings: EntityTable<Settings, 'key'>
}

db.version(1).stores({
  exercises: 'id, name, muscleGroup',
  programs: 'id, name, createdAt',
  programExercises: 'id, programId, exerciseId, order',
  workoutSessions: 'id, programId, startedAt',
  setLogs: 'id, sessionId, exerciseId, completedAt',
  bodyWeightEntries: 'id, date',
  settings: 'key',
})

export async function ensureSeeded() {
  // bulkPut (not bulkAdd) so concurrent calls (e.g. React StrictMode's
  // double-invoked effects in dev) can't collide on duplicate primary keys.
  await db.exercises.bulkPut(EXERCISES)
}

export function newId() {
  return crypto.randomUUID()
}

/** Egzersiz kütüphanesi hariç tüm kullanıcı verisini (programlar, antrenmanlar, kilo kayıtları, ayarlar) siler. */
export async function resetAllData() {
  await db.transaction(
    'rw',
    [db.programs, db.programExercises, db.workoutSessions, db.setLogs, db.bodyWeightEntries, db.settings],
    async () => {
      await db.programs.clear()
      await db.programExercises.clear()
      await db.workoutSessions.clear()
      await db.setLogs.clear()
      await db.bodyWeightEntries.clear()
      await db.settings.clear()
    },
  )
}
