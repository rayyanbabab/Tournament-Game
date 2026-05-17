'use client'

import { useEffect, useState } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function calc(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function CountdownTimer({
  targetDate,
  label = 'Pendaftaran ditutup dalam',
}: {
  targetDate: string
  label?: string
}) {
  const [time, setTime] = useState<TimeLeft>(() => calc(new Date(targetDate)))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(calc(new Date(targetDate)))
    const id = setInterval(() => setTime(calc(new Date(targetDate))), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-white/10" />
            <div className="w-10 h-2 mt-1 rounded bg-white/10" />
          </div>
        ))}
      </div>
    )
  }

  if (time.expired) {
    return (
      <p className="text-white/70 text-sm font-medium bg-white/10 px-4 py-2 rounded-full">
        Pendaftaran telah ditutup
      </p>
    )
  }

  const units = [
    { value: time.days, label: 'Hari' },
    { value: time.hours, label: 'Jam' },
    { value: time.minutes, label: 'Menit' },
    { value: time.seconds, label: 'Detik' },
  ]

  return (
    <div className="space-y-2">
      <p className="text-white/70 text-xs font-medium uppercase tracking-widest">{label}</p>
      <div className="flex items-start gap-2 sm:gap-3">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-start gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <div className="min-w-[52px] sm:min-w-[64px] h-14 sm:h-16 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {pad(u.value)}
                </span>
              </div>
              <span className="text-[10px] text-white/60 mt-1 font-medium">{u.label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="text-2xl font-bold text-white/40 mt-2">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
