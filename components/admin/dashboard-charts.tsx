'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval } from 'date-fns'
import { id } from 'date-fns/locale'

type Period = '7d' | '30d' | '90d'

interface VisitorsChartProps {
  registrations: { registered_at: string; status: string }[]
}

function generateTimeSeriesData(registrations: { registered_at: string }[], period: Period) {
  const now = new Date()
  const start =
    period === '7d' ? subDays(now, 7)
    : period === '30d' ? subDays(now, 30)
    : subDays(now, 90)

  const days = eachDayOfInterval({ start, end: now })

  return days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const count = registrations.filter((r) => r.registered_at.startsWith(dayStr)).length
    return {
      date: day,
      label: period === '7d' ? format(day, 'EEE', { locale: id }) : format(day, 'dd MMM', { locale: id }),
      registrations: count,
    }
  })
}

export function AdminAreaChart({ registrations }: VisitorsChartProps) {
  const [period, setPeriod] = useState<Period>('90d')

  const data = useMemo(() => generateTimeSeriesData(registrations, period), [period])

  const periods: { key: Period; label: string }[] = [
    { key: '90d', label: 'Last 3 months' },
    { key: '30d', label: 'Last 30 days' },
    { key: '7d', label: 'Last 7 days' },
  ]

  const totalRegistrations = data.reduce((s, d) => s + d.registrations, 0)
  const peakDay = data.reduce((max, d) => d.registrations > max.registrations ? d : max, data[0] || { label: '-', registrations: 0 })

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Aktivitas Pendaftaran</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total pendaftaran {period === '90d' ? '3 bulan terakhir' : period === '30d' ? '30 hari terakhir' : '7 hari terakhir'}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1 bg-muted/30">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md transition-all',
                period === key
                  ? 'bg-background text-foreground shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Real stats */}
      <div className="flex items-center gap-6 px-5 pb-4">
        <div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalRegistrations}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-foreground/70"></span>Total Pendaftaran
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-muted-foreground tabular-nums">{peakDay.registrations}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-primary/60"></span>Terbanyak ({peakDay.label})
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradReg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval={period === '90d' ? 6 : period === '30d' ? 3 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="registrations"
              name="Pendaftaran"
              stroke="hsl(var(--foreground))"
              strokeWidth={1.5}
              fill="url(#gradReg)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--foreground))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Registration Status Bar Chart
export function RegistrationStatusChart({ data }: { data: { name: string; value: number }[] }) {
  const colors: Record<string, string> = {
    'Menunggu': 'hsl(43 96% 56%)',
    'Disetujui': 'hsl(142 71% 45%)',
    'Ditolak': 'hsl(0 72% 51%)',
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-base font-semibold text-foreground">Status Pendaftaran</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Distribusi status pendaftaran tim</p>
      </div>
      <div className="h-48 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" name="Jumlah" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((entry, i) => (
                <Cell key={i} fill={colors[entry.name] || 'hsl(var(--primary))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
