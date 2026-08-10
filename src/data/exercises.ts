import type { Exercise, MuscleGroup } from '../types'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Göğüs',
  'Sırt',
  'Omuz',
  'Biceps',
  'Triceps',
  'Bacak',
  'Hamstring',
  'Kalça',
  'Baldır',
  'Karın',
  'Ön Kol',
  'Trapez',
  'Boyun',
  'Tüm Vücut',
  'Kardiyo',
]

const raw: [string, MuscleGroup][] = [
  // ---- Göğüs ----
  // Barbell / Makine
  ['Bench Press', 'Göğüs'],
  ['Incline Bench Press', 'Göğüs'],
  ['Decline Bench Press', 'Göğüs'],
  ['Wide Grip Bench Press', 'Göğüs'],
  ['Smith Machine Bench Press', 'Göğüs'],
  ['Smith Machine Incline Press', 'Göğüs'],
  ['Chest Press Machine', 'Göğüs'],
  ['Incline Chest Press Machine', 'Göğüs'],
  ['Decline Chest Press Machine', 'Göğüs'],
  // Dumbbell
  ['Dumbbell Bench Press', 'Göğüs'],
  ['Incline Dumbbell Press', 'Göğüs'],
  ['Decline Dumbbell Press', 'Göğüs'],
  ['Dumbbell Floor Press', 'Göğüs'],
  ['Dumbbell Squeeze Press', 'Göğüs'],
  ['Dumbbell Fly', 'Göğüs'],
  ['Incline Dumbbell Fly', 'Göğüs'],
  ['Decline Dumbbell Fly', 'Göğüs'],
  // Cable
  ['Cable Chest Press', 'Göğüs'],
  ['Cable Crossover', 'Göğüs'],
  ['High Cable Crossover', 'Göğüs'],
  ['Low Cable Crossover', 'Göğüs'],
  ['Cable Fly', 'Göğüs'],
  ['Low-to-High Cable Fly', 'Göğüs'],
  ['High-to-Low Cable Fly', 'Göğüs'],
  // Vücut ağırlığı
  ['Push-Up', 'Göğüs'],
  ['Wide Push-Up', 'Göğüs'],
  ['Close Grip Push-Up', 'Göğüs'],
  ['Diamond Push-Up', 'Göğüs'],
  ['Incline Push-Up', 'Göğüs'],
  ['Decline Push-Up', 'Göğüs'],
  ['Archer Push-Up', 'Göğüs'],
  ['Explosive Push-Up', 'Göğüs'],
  ['Chest Dips', 'Göğüs'],
  // Band
  ['Resistance Band Chest Press', 'Göğüs'],
  ['Resistance Band Chest Fly', 'Göğüs'],
  ['Resistance Band Crossover', 'Göğüs'],
  ['Resistance Band Push-Up', 'Göğüs'],

  // ---- Sırt ----
  // Lat / Dikey çekiş
  ['Pull-Up', 'Sırt'],
  ['Chin-Up', 'Sırt'],
  ['Wide Grip Pull-Up', 'Sırt'],
  ['Close Grip Pull-Up', 'Sırt'],
  ['Neutral Grip Pull-Up', 'Sırt'],
  ['Assisted Pull-Up', 'Sırt'],
  ['Lat Pulldown', 'Sırt'],
  ['Wide Grip Lat Pulldown', 'Sırt'],
  ['Close Grip Lat Pulldown', 'Sırt'],
  ['Neutral Grip Lat Pulldown', 'Sırt'],
  ['Reverse Grip Lat Pulldown', 'Sırt'],
  ['Single Arm Lat Pulldown', 'Sırt'],
  // Row
  ['Barbell Row', 'Sırt'],
  ['Pendlay Row', 'Sırt'],
  ['T-Bar Row', 'Sırt'],
  ['Chest Supported Row', 'Sırt'],
  ['Dumbbell Row', 'Sırt'],
  ['Single Arm Dumbbell Row', 'Sırt'],
  ['Incline Dumbbell Row', 'Sırt'],
  ['Seated Cable Row', 'Sırt'],
  ['Close Grip Seated Row', 'Sırt'],
  ['Wide Grip Seated Row', 'Sırt'],
  ['Single Arm Cable Row', 'Sırt'],
  ['Low Row Machine', 'Sırt'],
  ['High Row Machine', 'Sırt'],
  ['Machine Row', 'Sırt'],
  ['Chest Supported Machine Row', 'Sırt'],
  // Deadlift / posterior chain
  ['Conventional Deadlift', 'Sırt'],
  ['Sumo Deadlift', 'Sırt'],
  ['Romanian Deadlift', 'Sırt'],
  ['Stiff Leg Deadlift', 'Sırt'],
  ['Trap Bar Deadlift', 'Sırt'],
  ['Dumbbell Deadlift', 'Sırt'],
  ['Dumbbell Romanian Deadlift', 'Sırt'],
  ['Kettlebell Deadlift', 'Sırt'],
  ['Kettlebell Row', 'Sırt'],
  // Cable / Band
  ['Straight Arm Pulldown', 'Sırt'],
  ['Cable Pullover', 'Sırt'],
  ['Dumbbell Pullover', 'Sırt'],
  ['Resistance Band Lat Pulldown', 'Sırt'],
  ['Resistance Band Row', 'Sırt'],
  ['Resistance Band Straight Arm Pulldown', 'Sırt'],

  // ---- Omuz ----
  // Dumbbell
  ['Dumbbell Shoulder Press', 'Omuz'],
  ['Seated Dumbbell Shoulder Press', 'Omuz'],
  ['Arnold Press', 'Omuz'],
  ['Dumbbell Lateral Raise', 'Omuz'],
  ['Dumbbell Front Raise', 'Omuz'],
  ['Dumbbell Rear Delt Fly', 'Omuz'],
  ['Incline Rear Delt Fly', 'Omuz'],
  // Barbell
  ['Overhead Press', 'Omuz'],
  ['Push Press', 'Omuz'],
  ['Behind The Neck Press', 'Omuz'],
  // Machine
  ['Shoulder Press Machine', 'Omuz'],
  ['Lateral Raise Machine', 'Omuz'],
  ['Rear Delt Machine', 'Omuz'],
  // Cable
  ['Cable Lateral Raise', 'Omuz'],
  ['Single Arm Cable Lateral Raise', 'Omuz'],
  ['Cable Front Raise', 'Omuz'],
  ['Cable Rear Delt Fly', 'Omuz'],
  ['Face Pull', 'Omuz'],
  ['Cable Upright Row', 'Omuz'],
  // Band
  ['Band Shoulder Press', 'Omuz'],
  ['Band Lateral Raise', 'Omuz'],
  ['Band Front Raise', 'Omuz'],
  ['Band Rear Delt Fly', 'Omuz'],
  ['Band Face Pull', 'Omuz'],
  ['Band Pull Apart', 'Omuz'],
  // Vücut ağırlığı
  ['Pike Push-Up', 'Omuz'],
  ['Handstand Push-Up', 'Omuz'],
  ['Wall Assisted Handstand Push-Up', 'Omuz'],
  // Kettlebell
  ['Kettlebell Press', 'Omuz'],
  ['Kettlebell Push Press', 'Omuz'],

  // ---- Biceps ----
  // Dumbbell
  ['Dumbbell Curl', 'Biceps'],
  ['Alternating Dumbbell Curl', 'Biceps'],
  ['Hammer Curl', 'Biceps'],
  ['Cross Body Hammer Curl', 'Biceps'],
  ['Incline Dumbbell Curl', 'Biceps'],
  ['Concentration Curl', 'Biceps'],
  ['Zottman Curl', 'Biceps'],
  ['Spider Curl', 'Biceps'],
  ['Preacher Dumbbell Curl', 'Biceps'],
  // Barbell / EZ Bar
  ['Barbell Curl', 'Biceps'],
  ['EZ Bar Curl', 'Biceps'],
  ['Wide Grip Barbell Curl', 'Biceps'],
  ['Close Grip Barbell Curl', 'Biceps'],
  ['Reverse Curl', 'Biceps'],
  ['Preacher Curl', 'Biceps'],
  // Cable
  ['Cable Curl', 'Biceps'],
  ['Single Arm Cable Curl', 'Biceps'],
  ['Cable Hammer Curl', 'Biceps'],
  ['Bayesian Curl', 'Biceps'],
  ['Cable Preacher Curl', 'Biceps'],
  // Machine
  ['Biceps Curl Machine', 'Biceps'],
  ['Preacher Curl Machine', 'Biceps'],
  // Band
  ['Resistance Band Curl', 'Biceps'],
  ['Resistance Band Hammer Curl', 'Biceps'],
  ['Resistance Band Preacher Curl', 'Biceps'],

  // ---- Triceps ----
  // Cable
  ['Cable Pushdown', 'Triceps'],
  ['Rope Pushdown', 'Triceps'],
  ['Straight Bar Pushdown', 'Triceps'],
  ['V-Bar Pushdown', 'Triceps'],
  ['Single Arm Cable Pushdown', 'Triceps'],
  ['Overhead Cable Extension', 'Triceps'],
  ['Rope Overhead Extension', 'Triceps'],
  ['Cable Kickback', 'Triceps'],
  // Dumbbell
  ['Dumbbell Overhead Extension', 'Triceps'],
  ['Single Arm Dumbbell Extension', 'Triceps'],
  ['Dumbbell Skull Crusher', 'Triceps'],
  ['Dumbbell Kickback', 'Triceps'],
  ['Dumbbell Tate Press', 'Triceps'],
  ['Close Grip Dumbbell Press', 'Triceps'],
  // Barbell / EZ Bar
  ['Skull Crusher', 'Triceps'],
  ['EZ Bar Skull Crusher', 'Triceps'],
  ['Close Grip Bench Press', 'Triceps'],
  ['JM Press', 'Triceps'],
  // Machine
  ['Triceps Extension Machine', 'Triceps'],
  ['Assisted Dip Machine', 'Triceps'],
  // Vücut ağırlığı
  ['Bench Dips', 'Triceps'],
  ['Parallel Bar Dips', 'Triceps'],
  // Band
  ['Band Pushdown', 'Triceps'],
  ['Band Overhead Extension', 'Triceps'],
  ['Band Kickback', 'Triceps'],

  // ---- Bacak (Quadriceps) ----
  // Barbell
  ['Barbell Squat', 'Bacak'],
  ['Front Squat', 'Bacak'],
  ['Box Squat', 'Bacak'],
  ['Pause Squat', 'Bacak'],
  ['Hack Squat', 'Bacak'],
  // Dumbbell
  ['Dumbbell Squat', 'Bacak'],
  ['Goblet Squat', 'Bacak'],
  ['Dumbbell Front Squat', 'Bacak'],
  ['Dumbbell Split Squat', 'Bacak'],
  // Machine
  ['Leg Press', 'Bacak'],
  ['45 Degree Leg Press', 'Bacak'],
  ['Horizontal Leg Press', 'Bacak'],
  ['Hack Squat Machine', 'Bacak'],
  ['Leg Extension', 'Bacak'],
  ['Pendulum Squat', 'Bacak'],
  // Vücut ağırlığı
  ['Bodyweight Squat', 'Bacak'],
  ['Jump Squat', 'Bacak'],
  ['Bulgarian Split Squat', 'Bacak'],
  ['Reverse Lunge', 'Bacak'],
  ['Forward Lunge', 'Bacak'],
  ['Walking Lunge', 'Bacak'],
  ['Step-Up', 'Bacak'],
  ['Pistol Squat', 'Bacak'],
  ['Wall Sit', 'Bacak'],
  // Band
  ['Band Squat', 'Bacak'],
  ['Band Front Squat', 'Bacak'],
  ['Band Split Squat', 'Bacak'],
  ['Band Lunge', 'Bacak'],
  ['Band Leg Extension', 'Bacak'],
  // Kettlebell
  ['Kettlebell Goblet Squat', 'Bacak'],
  ['Kettlebell Front Squat', 'Bacak'],
  ['Kettlebell Lunge', 'Bacak'],
  ['Kettlebell Reverse Lunge', 'Bacak'],
  ['Kettlebell Step-Up', 'Bacak'],

  // ---- Hamstring ----
  // Barbell
  ['Good Morning', 'Hamstring'],
  // Dumbbell
  ['Dumbbell Stiff Leg Deadlift', 'Hamstring'],
  ['Dumbbell Good Morning', 'Hamstring'],
  ['Dumbbell Leg Curl', 'Hamstring'],
  // Machine
  ['Seated Leg Curl', 'Hamstring'],
  ['Lying Leg Curl', 'Hamstring'],
  ['Standing Leg Curl', 'Hamstring'],
  ['Glute Ham Raise', 'Hamstring'],
  ['Nordic Hamstring Curl', 'Hamstring'],
  // Cable / Band
  ['Cable Leg Curl', 'Hamstring'],
  ['Standing Cable Leg Curl', 'Hamstring'],
  ['Band Leg Curl', 'Hamstring'],
  ['Band Good Morning', 'Hamstring'],
  // Vücut ağırlığı
  ['Nordic Curl', 'Hamstring'],
  ['Sliding Leg Curl', 'Hamstring'],
  ['Single Leg Glute Bridge', 'Hamstring'],
  // Kettlebell
  ['Kettlebell Romanian Deadlift', 'Hamstring'],

  // ---- Kalça (Glute) ----
  // Barbell
  ['Barbell Hip Thrust', 'Kalça'],
  ['Barbell Glute Bridge', 'Kalça'],
  ['Sumo Squat', 'Kalça'],
  // Dumbbell
  ['Dumbbell Hip Thrust', 'Kalça'],
  ['Dumbbell Glute Bridge', 'Kalça'],
  ['Dumbbell Bulgarian Split Squat', 'Kalça'],
  ['Dumbbell Step-Up', 'Kalça'],
  ['Dumbbell Reverse Lunge', 'Kalça'],
  ['Dumbbell Walking Lunge', 'Kalça'],
  ['Dumbbell Sumo Squat', 'Kalça'],
  // Cable
  ['Cable Glute Kickback', 'Kalça'],
  ['Cable Pull Through', 'Kalça'],
  ['Cable Hip Abduction', 'Kalça'],
  ['Cable Hip Extension', 'Kalça'],
  // Machine
  ['Hip Thrust Machine', 'Kalça'],
  ['Glute Drive', 'Kalça'],
  ['Glute Kickback Machine', 'Kalça'],
  ['Hip Abduction Machine', 'Kalça'],
  ['Hip Adduction Machine', 'Kalça'],
  // Band
  ['Band Hip Thrust', 'Kalça'],
  ['Band Glute Bridge', 'Kalça'],
  ['Band Glute Kickback', 'Kalça'],
  ['Band Lateral Walk', 'Kalça'],
  ['Band Hip Abduction', 'Kalça'],
  ['Band Clamshell', 'Kalça'],
  // Vücut ağırlığı
  ['Glute Bridge', 'Kalça'],
  ['Donkey Kick', 'Kalça'],
  ['Fire Hydrant', 'Kalça'],
  ['Frog Pump', 'Kalça'],
  ['Hip Thrust', 'Kalça'],
  ['Single Leg Hip Thrust', 'Kalça'],
  // Kettlebell
  ['Kettlebell Swing', 'Kalça'],
  ['Russian Kettlebell Swing', 'Kalça'],
  ['American Kettlebell Swing', 'Kalça'],

  // ---- Baldır (Calves) ----
  // Makine
  ['Standing Calf Raise', 'Baldır'],
  ['Seated Calf Raise', 'Baldır'],
  ['Leg Press Calf Raise', 'Baldır'],
  ['Calf Raise Machine', 'Baldır'],
  // Barbell / Dumbbell
  ['Barbell Calf Raise', 'Baldır'],
  ['Dumbbell Calf Raise', 'Baldır'],
  ['Single Leg Dumbbell Calf Raise', 'Baldır'],
  // Vücut ağırlığı
  ['Bodyweight Calf Raise', 'Baldır'],
  ['Single Leg Calf Raise', 'Baldır'],
  ['Donkey Calf Raise', 'Baldır'],
  // Band
  ['Band Calf Raise', 'Baldır'],

  // ---- Karın ----
  // Vücut ağırlığı
  ['Crunch', 'Karın'],
  ['Sit-Up', 'Karın'],
  ['Reverse Crunch', 'Karın'],
  ['Bicycle Crunch', 'Karın'],
  ['Mountain Climber', 'Karın'],
  ['Leg Raise', 'Karın'],
  ['Lying Leg Raise', 'Karın'],
  ['Hanging Leg Raise', 'Karın'],
  ['Knee Raise', 'Karın'],
  ['Flutter Kicks', 'Karın'],
  ['V-Up', 'Karın'],
  ['Toe Touch', 'Karın'],
  ['Dead Bug', 'Karın'],
  ['Hollow Body Hold', 'Karın'],
  ['Plank', 'Karın'],
  ['Side Plank', 'Karın'],
  ['Plank Shoulder Tap', 'Karın'],
  // Cable
  ['Cable Crunch', 'Karın'],
  ['Cable Woodchopper', 'Karın'],
  ['Cable Rotation', 'Karın'],
  ['Pallof Press', 'Karın'],
  ['Kneeling Cable Crunch', 'Karın'],
  // Machine
  ['Ab Crunch Machine', 'Karın'],
  ['Rotary Torso Machine', 'Karın'],
  // Dumbbell
  ['Dumbbell Side Bend', 'Karın'],
  ['Dumbbell Russian Twist', 'Karın'],
  ['Dumbbell Woodchop', 'Karın'],
  ['Dumbbell Sit-Up', 'Karın'],
  ['Dumbbell Overhead Carry', 'Karın'],
  // Band
  ['Band Crunch', 'Karın'],
  ['Band Woodchop', 'Karın'],
  ['Band Pallof Press', 'Karın'],
  ['Band Rotation', 'Karın'],
  ['Band Leg Raise', 'Karın'],
  // Kettlebell
  ['Kettlebell Windmill', 'Karın'],

  // ---- Ön Kol (Forearm) ----
  ['Wrist Curl', 'Ön Kol'],
  ['Reverse Wrist Curl', 'Ön Kol'],
  ['Dumbbell Wrist Curl', 'Ön Kol'],
  ['Barbell Wrist Curl', 'Ön Kol'],
  ['Reverse Barbell Wrist Curl', 'Ön Kol'],
  ["Farmer's Walk", 'Ön Kol'],
  ["Dumbbell Farmer's Walk", 'Ön Kol'],
  ['Plate Pinch', 'Ön Kol'],
  ['Dead Hang', 'Ön Kol'],
  ['Towel Dead Hang', 'Ön Kol'],
  ['Wrist Roller', 'Ön Kol'],
  ["Kettlebell Farmer's Carry", 'Ön Kol'],

  // ---- Trapez ----
  ['Barbell Shrug', 'Trapez'],
  ['Dumbbell Shrug', 'Trapez'],
  ['Smith Machine Shrug', 'Trapez'],
  ['Cable Shrug', 'Trapez'],
  ['Machine Shrug', 'Trapez'],
  ['Behind The Back Shrug', 'Trapez'],
  ["Barbell Farmer's Walk", 'Trapez'],
  ['Upright Row', 'Trapez'],

  // ---- Boyun ----
  ['Neck Flexion', 'Boyun'],
  ['Neck Extension', 'Boyun'],
  ['Lateral Neck Flexion', 'Boyun'],
  ['Neck Rotation', 'Boyun'],
  ['Band Neck Flexion', 'Boyun'],
  ['Band Neck Extension', 'Boyun'],

  // ---- Tüm Vücut / Compound ----
  ['Clean', 'Tüm Vücut'],
  ['Power Clean', 'Tüm Vücut'],
  ['Clean & Press', 'Tüm Vücut'],
  ['Thruster', 'Tüm Vücut'],
  ['Dumbbell Thruster', 'Tüm Vücut'],
  ['Dumbbell Clean', 'Tüm Vücut'],
  ['Dumbbell Snatch', 'Tüm Vücut'],
  ['Turkish Get-Up', 'Tüm Vücut'],
  ['Suitcase Carry', 'Tüm Vücut'],
  ['Sled Push', 'Tüm Vücut'],
  ['Sled Pull', 'Tüm Vücut'],
  ['Kettlebell Clean', 'Tüm Vücut'],
  ['Kettlebell Snatch', 'Tüm Vücut'],
  ['Kettlebell Suitcase Carry', 'Tüm Vücut'],

  // ---- Kardiyo ----
  ['Koşu Bandı', 'Kardiyo'],
  ['Treadmill Walking', 'Kardiyo'],
  ['Incline Treadmill Walking', 'Kardiyo'],
  ['Treadmill Jogging', 'Kardiyo'],
  ['Treadmill Running', 'Kardiyo'],
  ['Outdoor Walking', 'Kardiyo'],
  ['Outdoor Running', 'Kardiyo'],
  ['Sprint', 'Kardiyo'],
  ['Hill Sprint', 'Kardiyo'],
  ['Bisiklet', 'Kardiyo'],
  ['Stationary Bike', 'Kardiyo'],
  ['Upright Bike', 'Kardiyo'],
  ['Recumbent Bike', 'Kardiyo'],
  ['Spin Bike', 'Kardiyo'],
  ['Outdoor Cycling', 'Kardiyo'],
  ['Eliptik', 'Kardiyo'],
  ['Cross Trainer', 'Kardiyo'],
  ['Stair Climber', 'Kardiyo'],
  ['Stairmaster', 'Kardiyo'],
  ['Step Machine', 'Kardiyo'],
  ['Rowing Machine', 'Kardiyo'],
  ['İp Atlama', 'Kardiyo'],
  ['Battle Rope', 'Kardiyo'],
  ['Swimming', 'Kardiyo'],
  ['Boxing', 'Kardiyo'],
  ['Shadow Boxing', 'Kardiyo'],
  ['Heavy Bag', 'Kardiyo'],
  ['Hiking', 'Kardiyo'],
  ['Stair Running', 'Kardiyo'],
]

const INCLINE_EXERCISES = new Set([
  'Koşu Bandı',
  'Treadmill Walking',
  'Incline Treadmill Walking',
  'Treadmill Jogging',
  'Treadmill Running',
])

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const EXERCISES: Exercise[] = raw.map(([name, muscleGroup]) => ({
  id: slugify(name),
  name,
  muscleGroup,
  supportsIncline: INCLINE_EXERCISES.has(name) || undefined,
}))

if (import.meta.env.DEV) {
  const seen = new Map<string, string>()
  for (const ex of EXERCISES) {
    const prev = seen.get(ex.id)
    if (prev) console.warn(`Duplicate exercise id "${ex.id}": "${prev}" vs "${ex.name}"`)
    seen.set(ex.id, ex.name)
  }
}
