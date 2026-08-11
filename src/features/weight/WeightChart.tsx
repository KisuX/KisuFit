import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BodyWeightEntry } from '../../types'
import { formatDateShort } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'

interface WeightChartProps {
  entries: BodyWeightEntry[]
  goal: number | null
}

export function WeightChart({ entries, goal }: WeightChartProps) {
  const { t, locale } = useLanguage()

  if (entries.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-[var(--color-surface)] px-6 text-center text-sm text-[var(--color-muted)]">
        {t('weight.chartEmpty')}
      </div>
    )
  }

  const weights = entries.map((e) => e.weight)
  if (goal) weights.push(goal)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const pad = Math.max(1, (max - min) * 0.15)

  return (
    <div className="h-56 rounded-2xl bg-[var(--color-surface)] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={entries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
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
            formatter={(v) => [`${v} ${t('common.kg')}`, t('weight.tooltipLabel')]}
          />
          {goal && (
            <ReferenceLine
              y={goal}
              stroke="var(--color-gold)"
              strokeDasharray="4 4"
              label={{ value: t('weight.goalRefLabel'), position: 'insideTopRight', fill: 'var(--color-gold)', fontSize: 11 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
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
