let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

/**
 * Bir kullanıcı jestinin (buton tıklaması) içinden çağrılmalı: tarayıcıların otomatik oynatma
 * politikası yüzünden, AudioContext ilk kez burada başlatılıp/uyandırılırsa, daha sonra bir
 * setTimeout/setInterval içinden (jest dışı) çağrılan playChime() de sorunsuz çalışır.
 */
export function primeAudio() {
  getContext()
}

/** Kısa, iki notalı bir "bip" sesi çalar (dinlenme bitti / kardiyo hedefi gibi anlar için). */
export function playChime() {
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const notes = [880, 1175]
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = now + i * 0.15
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(start)
    osc.stop(start + 0.3)
  })
}
