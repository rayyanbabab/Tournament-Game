'use client'

import { useRef, useState, useTransition } from 'react'
import { Star, Trash2, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitTestimonial, deleteTestimonial } from './actions'

interface TestimonialFormProps {
  existing: {
    id: string
    content: string
    rating: number
    game: string | null
    handle: string | null
    approved: boolean
  } | null
}

export function TestimonialForm({ existing }: TestimonialFormProps) {
  const [rating, setRating]     = useState(existing?.rating ?? 5)
  const [hover, setHover]       = useState(0)
  const [message, setMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete]    = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('rating', rating.toString())
    startTransition(async () => {
      const res = await submitTestimonial(fd)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: existing ? 'Ulasan berhasil diperbarui!' : 'Ulasan berhasil dikirim! Menunggu persetujuan admin.' })
      }
      setTimeout(() => setMessage(null), 4000)
    })
  }

  const handleDelete = () => {
    startDelete(async () => {
      const res = await deleteTestimonial()
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Ulasan berhasil dihapus.' })
        formRef.current?.reset()
        setRating(5)
      }
      setTimeout(() => setMessage(null), 4000)
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Rating */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star className={`h-7 w-7 transition-colors ${
                star <= (hover || rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`} />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-amber-500">{rating}/5</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="text-sm font-medium text-foreground block mb-2">
          Ulasan Anda *
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={existing?.content ?? ''}
          required
          minLength={10}
          maxLength={500}
          rows={4}
          placeholder="Ceritakan pengalaman Anda bermain di GameArena..."
          className="w-full rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none transition-all"
        />
        <p className="text-[10px] text-muted-foreground mt-1">Minimal 10, maksimal 500 karakter.</p>
      </div>

      {/* Game */}
      <div>
        <label htmlFor="game" className="text-sm font-medium text-foreground block mb-2">
          Game Favorit <span className="text-muted-foreground font-normal">(opsional)</span>
        </label>
        <input
          id="game"
          name="game"
          type="text"
          defaultValue={existing?.game ?? ''}
          placeholder="Mobile Legends, Free Fire, Valorant..."
          className="w-full rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Handle */}
      <div>
        <label htmlFor="handle" className="text-sm font-medium text-foreground block mb-2">
          Username / Handle <span className="text-muted-foreground font-normal">(opsional)</span>
        </label>
        <input
          id="handle"
          name="handle"
          type="text"
          defaultValue={existing?.handle ?? ''}
          placeholder="@username_kamu"
          className="w-full rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            : 'bg-red-500/10 text-red-600 border-red-500/20'
        }`}>
          {message.type === 'success'
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />
          }
          {message.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending} className="gap-2 flex-1">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {existing ? 'Perbarui Ulasan' : 'Kirim Ulasan'}
        </Button>
        {existing && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isDeleting}
            onClick={handleDelete}
            className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 shrink-0"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </form>
  )
}
