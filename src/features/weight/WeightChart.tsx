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
import { useUnitSystem } from '../../hooks/useUnitSystem'

interface WeightChartProps {
  entries: BodyWeightEntry[]
  goal: number | null
}

export function WeightChart({ entries, goal }: WeightChartProps) {
  const { t, locale } = useLanguage()
  const { label: unitLabel, toDisplay } = useUnitSystem()

  if (entries.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-[var(--color-surface)] px-6 text-center text-sm text-[var(--color-muted)]">
        {t('weight.chartEmpty')}
      </div>
    )
  }

  const displayEntries = entries.map((e) => ({ ...e, weight: toDisplay(e.weight) }))
  const displayGoal = goal !== null ? toDisplay(goal) : null

  const weights = displayEntries.map((e) => e.weight)
  if (displayGoal) weights.push(displayGoal)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const pad = Math.max(1, (max - min) * 0.15)

  return (
    <div className="h-56 rounded-2xl bg-[var(--color-surface)] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayEntries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
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
            formatter={(v) => [`${v} ${unitLabel}`, t('weight.tooltipLabel')]}
          />
          {displayGoal && (
            <ReferenceLine
              y={displayGoal}
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
