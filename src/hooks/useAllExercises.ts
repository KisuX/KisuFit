import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Exercise } from '../types'

/** Yerleşik + kullanıcının eklediği özel hareketleri birlikte döner (db.exercises canlı sorgusu). */
export function useAllExercises(): Exercise[] {
  return useLiveQuery(() => db.exercises.toArray(), []) ?? []
}
