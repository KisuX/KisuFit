import { useEffect, useRef, useState } from 'react'

/**
 * Kalan süreyi her tikte "1 azalt" yerine bitiş zaman damgasından (Date.now() farkı) hesaplar.
 * Böylece sekme arkaplandayken setInterval yavaşlatılsa/atlansa bile, kullanıcı geri döndüğünde
 * (visibilitychange) doğru kalan süre anında hesaplanır ve gerekiyorsa onDone hemen tetiklenir.
 */
export function useRestTimer(onDone: (wasSkipped: boolean) => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const totalRef = useRef(0)
  const endAtRef = useRef<number | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const isActive = secondsLeft !== null

  useEffect(() => {
    if (!isActive) return

    function sync() {
      const endAt = endAtRef.current
      if (endAt === null) return
      const remaining = Math.ceil((endAt - Date.now()) / 1000)
      if (remaining <= 0) {
        endAtRef.current = null
        setSecondsLeft(null)
        onDoneRef.current(false)
      } else {
        setSecondsLeft(remaining)
      }
    }

    const interval = setInterval(sync, 1000)
    document.addEventListener('visibilitychange', sync)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [isActive])

  function start(seconds: number) {
    totalRef.current = seconds
    endAtRef.current = Date.now() + seconds * 1000
    setSecondsLeft(seconds)
  }

  function skip() {
    endAtRef.current = null
    setSecondsLeft(null)
    onDoneRef.current(true)
  }

  const progress = isActive && totalRef.current > 0 ? 1 - secondsLeft! / totalRef.current : 0

  return { secondsLeft, isActive, progress, start, skip }
}
