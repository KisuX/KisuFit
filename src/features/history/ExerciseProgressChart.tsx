import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDateShort } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'

interface ProgressPoint {
  date: string
  value: number
}

interface ExerciseProgressChartProps {
  points: ProgressPoint[]
  unit: string
  emptyLabel: string
}

export function ExerciseProgressChart({ points, unit, emptyLabel }: ExerciseProgressChartProps) {
  const { t, locale } = useLanguage()

  if (points.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-[var(--color-surface)] px-6 text-center text-sm text-[var(--color-muted)]">
        {emptyLabel}
      </div>
    )
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max(1, (max - min) * 0.15)

  return (
    <div className="h-56 rounded-2xl bg-[var(--color-surface)] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => formatDateShort(v, locale)}
            stroke="var(--color-muted)"
            tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            allowDecimals={false}
            stroke="var(--color-muted)"
            tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            tickLine={false}
            axisLine={false}
            width={38}
            tickMargin={4}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(v) => formatDateShort(String(v), locale)}
            formatter={(v) => [`${v} ${unit}`, t('exerciseHistory.valueLabel')]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--color-accent)' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
