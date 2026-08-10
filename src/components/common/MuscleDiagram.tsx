import type { MuscleGroup } from '../../types'

interface MuscleDiagramProps {
  muscleGroup: MuscleGroup
  className?: string
  /** 'dark' uygulamanın koyu temasına uyar; 'light' beyaz kart üzerinde spor salonu
   *  ekipman etiketlerindeki gibi açık gri vücut + kırmızı vurgu kullanır. */
  tone?: 'dark' | 'light'
}

const PALETTES = {
  dark: { body: 'var(--color-surface-2)', outline: 'var(--color-border)', highlight: 'var(--color-accent)' },
  light: { body: '#d6d6d6', outline: '#a3a3a3', highlight: '#dc2626' },
} as const

/**
 * Basit, şematik bir insan silueti üzerinde ilgili kas grubunu vurgulayan ikon.
 * Gerçek bir kişiyi değil, spor salonu ekipmanlarındaki gibi soyut bir figürü temsil eder.
 */
export function MuscleDiagram({ muscleGroup, className, tone = 'dark' }: MuscleDiagramProps) {
  const { body, outline, highlight } = PALETTES[tone]

  return (
    <svg viewBox="0 0 100 190" className={className} aria-hidden="true">
      {/* base silhouette */}
      <circle cx="50" cy="16" r="13" fill={body} stroke={outline} strokeWidth="1.5" />
      <path d="M28 34 Q50 25 72 34 L68 90 Q50 99 32 90 Z" fill={body} stroke={outline} strokeWidth="1.5" />
      <line x1="27" y1="38" x2="16" y2="96" stroke={body} strokeWidth="11" strokeLinecap="round" />
      <line x1="73" y1="38" x2="84" y2="96" stroke={body} strokeWidth="11" strokeLinecap="round" />
      <line x1="27" y1="38" x2="16" y2="96" stroke={outline} strokeWidth="11" strokeLinecap="round" opacity="0.35" />
      <line x1="73" y1="38" x2="84" y2="96" stroke={outline} strokeWidth="11" strokeLinecap="round" opacity="0.35" />
      <line x1="40" y1="88" x2="36" y2="178" stroke={body} strokeWidth="13" strokeLinecap="round" />
      <line x1="60" y1="88" x2="64" y2="178" stroke={body} strokeWidth="13" strokeLinecap="round" />

      {/* highlighted target region */}
      <g fill={highlight} stroke="none">
        {muscleGroup === 'Göğüs' && (
          <>
            <ellipse cx="40" cy="48" rx="10.5" ry="8" />
            <ellipse cx="60" cy="48" rx="10.5" ry="8" />
          </>
        )}

        {muscleGroup === 'Sırt' && <path d="M50 36 L70 46 L64 88 Q50 96 36 88 L30 46 Z" opacity="0.9" />}

        {muscleGroup === 'Omuz' && (
          <>
            <circle cx="27" cy="38" r="8.5" />
            <circle cx="73" cy="38" r="8.5" />
          </>
        )}

        {muscleGroup === 'Biceps' && (
          <>
            <line x1="26" y1="40" x2="19" y2="66" stroke={highlight} strokeWidth="11" strokeLinecap="round" />
            <line x1="74" y1="40" x2="81" y2="66" stroke={highlight} strokeWidth="11" strokeLinecap="round" />
          </>
        )}

        {muscleGroup === 'Triceps' && (
          <>
            <line x1="20" y1="68" x2="16" y2="94" stroke={highlight} strokeWidth="11" strokeLinecap="round" />
            <line x1="80" y1="68" x2="84" y2="94" stroke={highlight} strokeWidth="11" strokeLinecap="round" />
          </>
        )}

        {muscleGroup === 'Bacak' && (
          <>
            <line x1="40" y1="90" x2="36" y2="176" stroke={highlight} strokeWidth="12" strokeLinecap="round" />
            <line x1="60" y1="90" x2="64" y2="176" stroke={highlight} strokeWidth="12" strokeLinecap="round" />
          </>
        )}

        {muscleGroup === 'Karın' && <rect x="40" y="60" width="20" height="28" rx="5" />}

        {muscleGroup === 'Kalça' && (
          <>
            <ellipse cx="40" cy="90" rx="9" ry="7" />
            <ellipse cx="60" cy="90" rx="9" ry="7" />
          </>
        )}

        {muscleGroup === 'Kardiyo' && (
          <path d="M50 58 C42 48 28 52 28 64 C28 76 50 90 50 90 C50 90 72 76 72 64 C72 52 58 48 50 58 Z" />
        )}
      </g>
    </svg>
  )
}
