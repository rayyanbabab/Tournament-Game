'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  Legend,
} from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { id } from 'date-fns/locale'
import { TrendingUp, Activity, Clock, CheckCircle, XCircle } from 'lucide-react'

type Period = '7d' | '30d' | '90d'

interface VisitorsChartProps {
  registrations: { registered_at: string; status: string }[]
}

function generateTimeSeriesData(registrations: { registered_at: string }[], period: Period) {
  const now = new Date()
  const start =
    period === '7d'  ? subDays(now, 7)
    : period === '30d' ? subDays(now, 30)
    : subDays(now, 90)
  const days = eachDayOfInterval({ start, end: now })
  return days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const count = registrations.filter((r) => r.registered_at.startsWith(dayStr)).length
    return {
      date: day,
      label:
        period === '7d'
          ? format(day, 'EEE', { locale: id })
          : format(day, 'dd MMM', { locale: id }),
      registrations: count,
    }
  })
}

// Custom tooltip for AreaChart
const AreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-foreground">{payload[0].value} pendaftaran</p>
    </div>
  )
}

// Custom tooltip for BarChart
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-foreground">{payload[0].value} tim</p>
    </div>
  )
}

export function AdminAreaChart({ registrations }: VisitorsChartProps) {
  const [period, setPeriod] = useState<Period>('90d')

  const data = useMemo(() => generateTimeSeriesData(registrations, period), [period, registrations])

  const periods: { key: Period; label: string }[] = [
    { key: '90d', label: '3 Bulan' },
    { key: '30d', label: '30 Hari' },
    { key: '7d',  label: '7 Hari' },
  ]

  const totalRegistrations = data.reduce((s, d) => s + d.registrations, 0)
  const peakDay = data.reduce(
    (max, d) => (d.registrations > max.registrations ? d : max),
    data[0] || { label: '-', registrations: 0 }
  )
  const avgPerDay = data.length > 0 ? (totalRegistrations / data.length).toFixed(1) : '0'

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Aktivitas Pendaftaran</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {period === '90d' ? '3 bulan' : period === '30d' ? '30 hari' : '7 hari'} terakhir
            </p>
          </div>
        </div>
        {/* Period Picker */}
        <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1 bg-muted/30 self-start sm:self-auto">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md transition-all font-medium',
                period === key
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border/40'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
        {[
          { label: 'Total Periode', value: totalRegistrations, icon: TrendingUp, color: 'text-primary' },
          { label: 'Hari Terbanyak', value: peakDay.registrations, icon: Activity, color: 'text-emerald-500' },
          { label: 'Rata-rata/Hari', value: avgPerDay, icon: Clock, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex flex-col items-center justify-center py-4 px-3 text-center gap-1">
            <Icon className={`h-3.5 w-3.5 ${color} mb-0.5`} />
            <p className="text-xl font-extrabold text-foreground tabular-nums">{value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-56 px-2 pb-4 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <defs>
              {/* Primary gradient — works in both dark/light */}
              <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              interval={period === '90d' ? 8 : period === '30d' ? 4 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<AreaTooltip />} />
            <Area
              type="monotone"
              dataKey="registrations"
              name="Pendaftaran"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#gradPrimary)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Registration Status Chart ──
export function RegistrationStatusChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  // Fixed semantic colors — visible in both dark and light
  const colorMap: Record<string, { bar: string; bg: string; text: string; border: string; icon: any }> = {
    'Menunggu':  { bar: '#f59e0b', bg: 'bg-amber-500/10',   text: 'text-amber-600',   border: 'border-amber-500/20',   icon: Clock },
    'Disetujui': { bar: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', icon: CheckCircle },
    'Ditolak':   { bar: '#ef4444', bg: 'bg-red-500/10',     text: 'text-red-600',     border: 'border-red-500/20',     icon: XCircle },
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border/40">
        <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-violet-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Status Pendaftaran</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Distribusi dari <span className="font-semibold text-foreground">{total}</span> total pendaftaran
          </p>
        </div>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
        {data.map((item) => {
          const cfg = colorMap[item.name]
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
          const Icon = cfg?.icon
          return (
            <div key={item.name} className="flex flex-col items-center justify-center py-4 px-3 text-center gap-1">
              {Icon && <Icon className={`h-3.5 w-3.5 ${cfg.text} mb-0.5`} />}
              <p className={`text-xl font-extrabold tabular-nums ${cfg?.text ?? 'text-foreground'}`}>
                {item.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{item.name}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg?.bg} ${cfg?.text} ${cfg?.border}`}>
                {pct}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Bar Chart */}
      <div className="h-44 px-2 pb-4 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<BarTooltip />} />
            <Bar dataKey="value" name="Jumlah" radius={[6, 6, 0, 0]} barSize={48}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={colorMap[entry.name]?.bar ?? 'var(--primary)'}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend row */}
      <div className="flex items-center justify-center gap-4 px-5 pb-4">
        {data.map((item) => {
          const cfg = colorMap[item.name]
          return (
            <div key={item.name} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ background: cfg?.bar ?? '#888' }} />
              <span className="text-[11px] text-muted-foreground">{item.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
