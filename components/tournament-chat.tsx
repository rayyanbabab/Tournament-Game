'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
// Supabase client migrated to Neon - see /api routes
import { Send, Loader2, MessageCircle, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  user_id: string
  message: string
  created_at: string
  profiles: { full_name: string | null; avatar_url: string | null; role: string } | null
}

interface TournamentChatProps {
  tournamentId: string
  initialMessages: Message[]
  currentUserId: string
  isAdmin: boolean
}

export function TournamentChat({ tournamentId, initialMessages, currentUserId, isAdmin }: TournamentChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // const supabase = createClient() // migrated

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('chat-' + tournamentId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tournament_messages',
        filter: `tournament_id=eq.${tournamentId}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('tournament_messages')
          .select('*, profiles:user_id(full_name, avatar_url, role)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tournamentId, supabase])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    const { error } = await supabase.from('tournament_messages').insert({
      tournament_id: tournamentId,
      user_id: currentUserId,
      message: text,
    })
    if (error) setInput(text) // restore on error
    setSending(false)
    inputRef.current?.focus()
  }, [input, sending, tournamentId, currentUserId, supabase])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const getInitials = (name: string | null) =>
    (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20 shrink-0">
        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Lobby Chat</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{messages.length} pesan</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Belum ada pesan. Mulai percakapan!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.user_id === currentUserId
            const profile = msg.profiles
            const adminUser = profile?.role === 'admin'
            const showAvatar = i === 0 || messages[i - 1].user_id !== msg.user_id

            return (
              <div key={msg.id} className={cn('flex gap-2.5', isMe ? 'flex-row-reverse' : 'flex-row')}>
                {/* Avatar */}
                <div className={cn('shrink-0', showAvatar ? 'opacity-100' : 'opacity-0')}>
                  <div className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden',
                    adminUser ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-primary/10 border border-primary/20'
                  )}>
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      : <span className={adminUser ? 'text-amber-600' : 'text-primary'}>{getInitials(profile?.full_name ?? null)}</span>}
                  </div>
                </div>

                {/* Bubble */}
                <div className={cn('flex flex-col gap-0.5 max-w-[75%]', isMe ? 'items-end' : 'items-start')}>
                  {showAvatar && (
                    <div className={cn('flex items-center gap-1.5', isMe ? 'flex-row-reverse' : 'flex-row')}>
                      <span className="text-[11px] font-semibold text-foreground">
                        {isMe ? 'Kamu' : (profile?.full_name?.split(' ')[0] ?? 'User')}
                      </span>
                      {adminUser && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                          <Shield className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  )}
                  <div className={cn(
                    'px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words',
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : adminUser
                        ? 'bg-amber-500/10 border border-amber-500/20 text-foreground rounded-tl-sm'
                        : 'bg-muted text-foreground rounded-tl-sm'
                  )}>
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 px-1">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: idLocale })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/40 bg-muted/10 shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan... (Enter untuk kirim)"
            maxLength={500}
            className="flex-1 rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">{input.length}/500</p>
      </div>
    </div>
  )
}
