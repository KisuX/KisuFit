import { useEffect, useRef, useState } from 'react'

export function useRestTimer(onDone: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const totalRef = useRef(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (secondsLeft === null) return
    if (secondsLeft <= 0) {
      onDoneRef.current()
      setSecondsLeft(null)
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  function start(seconds: number) {
    totalRef.current = seconds
    setSecondsLeft(seconds)
  }

  function skip() {
    setSecondsLeft(null)
    onDoneRef.current()
  }

  const isActive = secondsLeft !== null
  const progress = isActive && totalRef.current > 0 ? 1 - secondsLeft! / totalRef.current : 0

  return { secondsLeft, isActive, progress, start, skip }
}
