'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const [userId, setUserId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Stable supabase instance — createClient() must NOT be called on every render
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchNotifs = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifs(data)
  }, [supabase])

  useEffect(() => {
    let mounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !mounted) return
      setUserId(user.id)
      fetchNotifs(user.id)

      // Unique suffix prevents "cannot add callbacks after subscribe()" on
      // React Strict Mode double-invoke or HMR hot-reload
      channel = supabase
        .channel(`notif-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (mounted) setNotifs(prev => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()
    })

    // This cleanup MUST be in the effect return, NOT inside .then()
    // otherwise React never calls it on unmount / Strict Mode second invocation
    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const unreadCount = notifs.filter(n => !n.read).length

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  async function markAllRead() {
    if (!userId) return
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  }

  if (!userId) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
        aria-label="Notifikasi"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border/60 bg-popover shadow-xl shadow-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-foreground" />
              <span className="text-sm font-semibold text-foreground">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {notifs.map(n => {
                  const Icon = typeIcon[n.type] ?? Megaphone
                  const color = typeColor[n.type] ?? 'text-muted-foreground'
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'flex gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-accent/50',
                        !n.read && 'bg-primary/5'
                      )}
                    >
                      <div className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                        !n.read ? 'bg-primary/10' : 'bg-muted'
                      )}>
                        <Icon className={cn('h-4 w-4', !n.read ? color : 'text-muted-foreground')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('text-xs font-semibold leading-tight', !n.read ? 'text-foreground' : 'text-muted-foreground')}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <button
                              onClick={e => { e.stopPropagation(); markRead(n.id) }}
                              className="shrink-0 h-4 w-4 flex items-center justify-center rounded-full hover:bg-primary/20 text-primary"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: idLocale })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
