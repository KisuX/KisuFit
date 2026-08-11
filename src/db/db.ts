import Dexie, { type EntityTable } from 'dexie'
import type {
  BodyWeightEntry,
  Exercise,
  Profile,
  Program,
  ProgramExercise,
  SetLog,
  Settings,
  WorkoutSession,
} from '../types'
import { EXERCISES } from '../data/exercises'

export const ACTIVE_PROFILE_STORAGE_KEY = 'kisufit:activeProfileId'

export const db = new Dexie('kisufit') as Dexie & {
  exercises: EntityTable<Exercise, 'id'>
  profiles: EntityTable<Profile, 'id'>
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

// v2: çoklu-profil desteği. Birincil anahtarlar (id / key) değişmiyor, sadece
// yeni `profileId` alanı + indeksi ekleniyor. Var olan veri (varsa) otomatik
// olarak "Profilim" adında bir varsayılan profile taşınır.
db.version(2)
  .stores({
    profiles: 'id, name, createdAt',
    programs: 'id, profileId, name, createdAt',
    programExercises: 'id, profileId, programId, exerciseId, order',
    workoutSessions: 'id, profileId, programId, startedAt',
    setLogs: 'id, profileId, sessionId, exerciseId, completedAt',
    bodyWeightEntries: 'id, profileId, date',
    settings: 'key, profileId',
  })
  .upgrade(async (tx) => {
    const hasExistingData =
      (await tx.table('programs').count()) > 0 ||
      (await tx.table('bodyWeightEntries').count()) > 0 ||
      (await tx.table('settings').count()) > 0
    if (!hasExistingData) return

    const defaultProfileId = crypto.randomUUID()
    await tx.table('profiles').add({ id: defaultProfileId, name: 'Profilim', createdAt: Date.now() })

    for (const name of ['programs', 'programExercises', 'workoutSessions', 'setLogs', 'bodyWeightEntries']) {
      await tx.table(name).toCollection().modify({ profileId: defaultProfileId })
    }

    const oldSettings = await tx.table('settings').toArray()
    await tx.table('settings').clear()
    for (const s of oldSettings) {
      await tx.table('settings').add({ key: `${defaultProfileId}:${s.key}`, profileId: defaultProfileId, value: s.value })
    }

    localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, defaultProfileId)
  })

export async function ensureSeeded() {
  // bulkPut (not bulkAdd) so concurrent calls (e.g. React StrictMode's
  // double-invoked effects in dev) can't collide on duplicate primary keys.
  await db.exercises.bulkPut(EXERCISES)
}

export function newId() {
  return crypto.randomUUID()
}

export function settingKey(profileId: string, name: string) {
  return `${profileId}:${name}`
}

/** Hareket kütüphanesi ve diğer profiller hariç, sadece verilen profilin tüm verisini siler. */
export async function resetProfileData(profileId: string) {
  await db.transaction(
    'rw',
    [db.programs, db.programExercises, db.workoutSessions, db.setLogs, db.bodyWeightEntries, db.settings],
    async () => {
      await db.programs.where('profileId').equals(profileId).delete()
      await db.programExercises.where('profileId').equals(profileId).delete()
      await db.workoutSessions.where('profileId').equals(profileId).delete()
      await db.setLogs.where('profileId').equals(profileId).delete()
      await db.bodyWeightEntries.where('profileId').equals(profileId).delete()
      await db.settings.where('profileId').equals(profileId).delete()
    },
  )
}

/** Profilin kaydını ve tüm verisini kalıcı olarak siler. */
export async function deleteProfile(profileId: string) {
  await resetProfileData(profileId)
  await db.profiles.delete(profileId)
}
