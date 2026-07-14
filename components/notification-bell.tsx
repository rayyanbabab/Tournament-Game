'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, Check, CheckCheck, Calendar, Trophy, Megaphone, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  data: Record<string, any>
}

const typeIcon: Record<string, React.ElementType> = {
  registration_approved: Trophy,
  registration_rejected: X,
  match_scheduled: Calendar,
  announcement: Megaphone,
}

const typeColor: Record<string, string> = {
  registration_approved: 'text-emerald-500',
  registration_rejected: 'text-red-500',
  match_scheduled: 'text-blue-500',
  announcement: 'text-violet-500',
}

export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const userId = session?.user?.id

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // No notifications table yet — show empty state
  // When you add a notifications table to Neon, fetch from /api/notifications here
  const unread = notifs.filter(n => !n.read).length

  if (!userId) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border/60 bg-card shadow-xl shadow-black/10 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifikasi</p>
              {unread > 0 && (
                <p className="text-xs text-muted-foreground">{unread} belum dibaca</p>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={() => setNotifs(prev => prev.map(n => ({ ...n, read: true })))}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Tandai semua
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
              </div>
            ) : (
              notifs.map(n => {
                const Icon = typeIcon[n.type] || Bell
                return (
                  <button
                    key={n.id}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0',
                      !n.read && 'bg-primary/5'
                    )}
                    onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <div className={cn('h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5', typeColor[n.type])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: idLocale })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-2" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
