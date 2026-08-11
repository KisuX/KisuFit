import { db, newId, settingKey } from '../db/db'
import { EXERCISES } from '../data/exercises'
import type {
  BodyWeightEntry,
  Exercise,
  Program,
  ProgramExercise,
  SetLog,
  WorkoutSession,
} from '../types'

export interface BackupData {
  version: 1
  exportedAt: number
  profileName: string
  exercises: Exercise[]
  programs: Program[]
  programExercises: ProgramExercise[]
  workoutSessions: WorkoutSession[]
  setLogs: SetLog[]
  bodyWeightEntries: BodyWeightEntry[]
  settings: { name: string; value: string }[]
}

export async function buildBackup(profileId: string, profileName: string): Promise<BackupData> {
  const [programs, programExercises, workoutSessions, setLogs, bodyWeightEntries, settingsRows, allExercises] =
    await Promise.all([
      db.programs.where('profileId').equals(profileId).toArray(),
      db.programExercises.where('profileId').equals(profileId).toArray(),
      db.workoutSessions.where('profileId').equals(profileId).toArray(),
      db.setLogs.where('profileId').equals(profileId).toArray(),
      db.bodyWeightEntries.where('profileId').equals(profileId).toArray(),
      db.settings.where('profileId').equals(profileId).toArray(),
      db.exercises.toArray(),
    ])

  const builtinIds = new Set(EXERCISES.map((e) => e.id))
  const usedExerciseIds = new Set(programExercises.map((pe) => pe.exerciseId))
  const customExercises = allExercises.filter((e) => usedExerciseIds.has(e.id) && !builtinIds.has(e.id))

  return {
    version: 1,
    exportedAt: Date.now(),
    profileName,
    exercises: customExercises,
    programs,
    programExercises,
    workoutSessions,
    setLogs,
    bodyWeightEntries,
    settings: settingsRows.map((s) => ({ name: s.key.slice(profileId.length + 1), value: s.value })),
  }
}

export function downloadBackup(data: BackupData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `kisufit-${data.profileName}-${date}.json`.replace(/\s+/g, '-')
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function isBackupData(value: unknown): value is BackupData {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return v.version === 1 && Array.isArray(v.programs) && Array.isArray(v.setLogs)
}

export async function parseBackupFile(file: File): Promise<BackupData> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Dosya okunamadı: geçerli bir JSON değil.')
  }
  if (!isBackupData(parsed)) throw new Error('Bu dosya bir KisuFit yedeği gibi görünmüyor.')
  return parsed
}

/** Yedekteki tüm id'leri yeniden üretir (aynı dosya birden çok kez içe aktarılabilsin) ve yeni bir profile yazar. */
export async function importBackup(data: BackupData, newProfileName: string): Promise<string> {
  const newProfileId = newId()
  await db.profiles.add({ id: newProfileId, name: newProfileName, createdAt: Date.now() })

  if (data.exercises.length) await db.exercises.bulkPut(data.exercises)

  const programIdMap = new Map<string, string>()
  const sessionIdMap = new Map<string, string>()

  const newPrograms = data.programs.map((p) => {
    const id = newId()
    programIdMap.set(p.id, id)
    return { ...p, id, profileId: newProfileId }
  })
  if (newPrograms.length) await db.programs.bulkAdd(newPrograms)

  const newProgramExercises = data.programExercises.map((pe) => ({
    ...pe,
    id: newId(),
    profileId: newProfileId,
    programId: programIdMap.get(pe.programId) ?? pe.programId,
  }))
  if (newProgramExercises.length) await db.programExercises.bulkAdd(newProgramExercises)

  const newSessions = data.workoutSessions.map((s) => {
    const id = newId()
    sessionIdMap.set(s.id, id)
    return { ...s, id, profileId: newProfileId, programId: programIdMap.get(s.programId) ?? s.programId }
  })
  if (newSessions.length) await db.workoutSessions.bulkAdd(newSessions)

  const newSetLogs = data.setLogs.map((l) => ({
    ...l,
    id: newId(),
    profileId: newProfileId,
    sessionId: sessionIdMap.get(l.sessionId) ?? l.sessionId,
  }))
  if (newSetLogs.length) await db.setLogs.bulkAdd(newSetLogs)

  const newWeightEntries = data.bodyWeightEntries.map((e) => ({ ...e, id: newId(), profileId: newProfileId }))
  if (newWeightEntries.length) await db.bodyWeightEntries.bulkAdd(newWeightEntries)

  if (data.settings.length) {
    await db.settings.bulkAdd(
      data.settings.map((s) => ({ key: settingKey(newProfileId, s.name), profileId: newProfileId, value: s.value })),
    )
  }

  return newProfileId
}
