export type MuscleGroup =
  | 'Göğüs'
  | 'Sırt'
  | 'Omuz'
  | 'Biceps'
  | 'Triceps'
  | 'Bacak'
  | 'Hamstring'
  | 'Kalça'
  | 'Baldır'
  | 'Karın'
  | 'Ön Kol'
  | 'Trapez'
  | 'Boyun'
  | 'Tüm Vücut'
  | 'Kardiyo'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  /** Sadece koşu bandı gibi kardiyo hareketlerinde eğim girişi gösterilir. */
  supportsIncline?: boolean
}

export interface Profile {
  id: string
  name: string
  createdAt: number
}

export interface Program {
  id: string
  profileId: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface ProgramExercise {
  id: string
  profileId: string
  programId: string
  exerciseId: string
  order: number
  sets: number
  reps: number
  weight: number
  restSeconds: number
  /** Kardiyo hareketleri için hedef süre (saniye). Kuvvet hareketlerinde kullanılmaz. */
  durationSeconds: number
  /** Kardiyo hareketleri için eğim (%). Sadece supportsIncline=true hareketlerde kullanılır. */
  incline: number | null
}

export interface WorkoutSession {
  id: string
  profileId: string
  programId: string
  programName: string
  startedAt: number
  finishedAt: number | null
  durationSec: number
}

export type PRType = 'weight' | 'reps' | 'both' | null

export interface SetLog {
  id: string
  profileId: string
  sessionId: string
  exerciseId: string
  exerciseName: string
  setNumber: number
  reps: number
  weight: number
  isPR: boolean
  prType: PRType
  completedAt: number
  /** Kardiyo hareketleri için kronometreyle ölçülen gerçek süre (saniye). */
  durationSeconds: number | null
  /** Kardiyo hareketleri için kullanılan eğim (%). */
  incline: number | null
}

export interface BodyWeightEntry {
  id: string
  profileId: string
  date: string // YYYY-MM-DD
  weight: number
}

export interface Settings {
  /** `${profileId}:${adı}` şeklinde oluşturulur. */
  key: string
  profileId: string
  value: string
}
