export type StepInput = number | ((value: number, direction: 'inc' | 'dec') => number)

/** Kilo alanları için: 10 kg altında 0.5, 10 kg ve üstünde 2.5'luk adımlarla artar/azalır. */
export const weightStep: StepInput = (value, direction) => {
  const inLowRange = direction === 'inc' ? value < 10 : value <= 10
  return inLowRange ? 0.5 : 2.5
}
