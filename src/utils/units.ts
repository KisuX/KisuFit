import type { StepInput } from './steppers'
import { weightStep } from './steppers'

export type WeightUnit = 'kg' | 'lb'

const KG_TO_LB = 2.2046226218

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Kanonik depolama birimi her zaman kg'dır; bu sadece görüntüleme/girdi için dönüştürür. */
export function kgToDisplay(kg: number, unit: WeightUnit): number {
  return unit === 'lb' ? round1(kg * KG_TO_LB) : round1(kg)
}

export function displayToKg(value: number, unit: WeightUnit): number {
  return unit === 'lb' ? value / KG_TO_LB : value
}

/** lb için: 20 lb altında 1'lik, 20 lb ve üstünde 5'lik adımlar (kg'daki 10/0.5/2.5 eşiğinin yaklaşık karşılığı). */
const weightStepLb: StepInput = (value, direction) => {
  const inLowRange = direction === 'inc' ? value < 20 : value <= 20
  return inLowRange ? 1 : 5
}

export function weightStepFor(unit: WeightUnit): StepInput {
  return unit === 'lb' ? weightStepLb : weightStep
}
