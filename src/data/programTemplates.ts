import { EXERCISES } from './exercises'

interface TemplateExercise {
  name: string
  sets?: number
  reps?: number
  weight?: number
  restSeconds?: number
}

export interface ProgramTemplate {
  id: string
  titleKey: string
  descKey: string
  exercises: TemplateExercise[]
}

const TEMPLATES_RAW: ProgramTemplate[] = [
  {
    id: 'push-day',
    titleKey: 'programTemplates.pushDay',
    descKey: 'programTemplates.pushDayDesc',
    exercises: [
      { name: 'Bench Press' },
      { name: 'Incline Dumbbell Press' },
      { name: 'Overhead Press' },
      { name: 'Cable Lateral Raise', weight: 8 },
      { name: 'Cable Pushdown', weight: 15 },
    ],
  },
  {
    id: 'pull-day',
    titleKey: 'programTemplates.pullDay',
    descKey: 'programTemplates.pullDayDesc',
    exercises: [
      { name: 'Pull-Up', weight: 0 },
      { name: 'Barbell Row' },
      { name: 'Lat Pulldown' },
      { name: 'Face Pull', weight: 12 },
      { name: 'Barbell Curl', weight: 15 },
    ],
  },
  {
    id: 'leg-day',
    titleKey: 'programTemplates.legDay',
    descKey: 'programTemplates.legDayDesc',
    exercises: [
      { name: 'Barbell Squat' },
      { name: 'Leg Press', weight: 40 },
      { name: 'Lying Leg Curl' },
      { name: 'Leg Extension' },
      { name: 'Standing Calf Raise' },
    ],
  },
  {
    id: 'full-body',
    titleKey: 'programTemplates.fullBody',
    descKey: 'programTemplates.fullBodyDesc',
    exercises: [
      { name: 'Barbell Squat' },
      { name: 'Bench Press' },
      { name: 'Barbell Row' },
      { name: 'Overhead Press' },
      { name: 'Hanging Leg Raise', weight: 0 },
    ],
  },
]

function exerciseIdFor(name: string): string {
  const found = EXERCISES.find((e) => e.name === name)
  if (!found) throw new Error(`programTemplates: unknown exercise "${name}"`)
  return found.id
}

export interface ResolvedTemplateExercise {
  exerciseId: string
  sets: number
  reps: number
  weight: number
  restSeconds: number
}

export interface ResolvedTemplate {
  id: string
  titleKey: string
  descKey: string
  exercises: ResolvedTemplateExercise[]
}

export const PROGRAM_TEMPLATES: ResolvedTemplate[] = TEMPLATES_RAW.map((t) => ({
  id: t.id,
  titleKey: t.titleKey,
  descKey: t.descKey,
  exercises: t.exercises.map((e) => ({
    exerciseId: exerciseIdFor(e.name),
    sets: e.sets ?? 3,
    reps: e.reps ?? 10,
    weight: e.weight ?? 20,
    restSeconds: e.restSeconds ?? 90,
  })),
}))
