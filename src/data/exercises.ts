import type { Exercise, MuscleGroup } from '../types'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Göğüs',
  'Sırt',
  'Omuz',
  'Biceps',
  'Triceps',
  'Bacak',
  'Karın',
  'Kalça',
  'Kardiyo',
]

const raw: [string, MuscleGroup][] = [
  // Göğüs
  ['Bench Press', 'Göğüs'],
  ['Eğimli Bench Press', 'Göğüs'],
  ['Negatif Eğimli Bench Press', 'Göğüs'],
  ['Dumbbell Press', 'Göğüs'],
  ['Eğimli Dumbbell Press', 'Göğüs'],
  ['Chest Fly (Dumbbell)', 'Göğüs'],
  ['Cable Crossover', 'Göğüs'],
  ['Pec Deck', 'Göğüs'],
  ['Dips (Göğüs)', 'Göğüs'],
  ['Push-up', 'Göğüs'],
  // Sırt
  ['Lat Pulldown', 'Sırt'],
  ['Barbell Row', 'Sırt'],
  ['Dumbbell Row', 'Sırt'],
  ['Pull-up', 'Sırt'],
  ['Deadlift', 'Sırt'],
  ['T-Bar Row', 'Sırt'],
  ['Seated Cable Row', 'Sırt'],
  ['Straight Arm Pulldown', 'Sırt'],
  ['Hyperextension', 'Sırt'],
  // Omuz
  ['Shoulder Press (Dumbbell)', 'Omuz'],
  ['Shoulder Press (Barbell)', 'Omuz'],
  ['Lateral Raise', 'Omuz'],
  ['Front Raise', 'Omuz'],
  ['Rear Delt Fly', 'Omuz'],
  ['Arnold Press', 'Omuz'],
  ['Shrug', 'Omuz'],
  ['Cable Lateral Raise', 'Omuz'],
  // Biceps
  ['Barbell Curl', 'Biceps'],
  ['Dumbbell Curl', 'Biceps'],
  ['Hammer Curl', 'Biceps'],
  ['Preacher Curl', 'Biceps'],
  ['Cable Curl', 'Biceps'],
  ['Concentration Curl', 'Biceps'],
  // Triceps
  ['Triceps Pushdown', 'Triceps'],
  ['Skull Crusher', 'Triceps'],
  ['Overhead Triceps Extension', 'Triceps'],
  ['Close Grip Bench Press', 'Triceps'],
  ['Dips (Triceps)', 'Triceps'],
  ['Kickback', 'Triceps'],
  // Bacak
  ['Squat', 'Bacak'],
  ['Leg Press', 'Bacak'],
  ['Lunge', 'Bacak'],
  ['Leg Extension', 'Bacak'],
  ['Leg Curl', 'Bacak'],
  ['Romanian Deadlift', 'Bacak'],
  ['Calf Raise', 'Bacak'],
  ['Bulgarian Split Squat', 'Bacak'],
  ['Hack Squat', 'Bacak'],
  // Kalça
  ['Hip Thrust', 'Kalça'],
  ['Cable Kickback', 'Kalça'],
  ['Abduction Machine', 'Kalça'],
  // Karın
  ['Crunch', 'Karın'],
  ['Plank', 'Karın'],
  ['Leg Raise', 'Karın'],
  ['Russian Twist', 'Karın'],
  ['Cable Crunch', 'Karın'],
  ['Ab Wheel', 'Karın'],
  // Kardiyo
  ['Koşu Bandı', 'Kardiyo'],
  ['Bisiklet', 'Kardiyo'],
  ['İp Atlama', 'Kardiyo'],
  ['Eliptik', 'Kardiyo'],
  ['Rowing Machine', 'Kardiyo'],
]

const INCLINE_EXERCISES = new Set(['Koşu Bandı'])

export const EXERCISES: Exercise[] = raw.map(([name, muscleGroup], i) => ({
  id: `ex-${i + 1}`,
  name,
  muscleGroup,
  supportsIncline: INCLINE_EXERCISES.has(name) || undefined,
}))
