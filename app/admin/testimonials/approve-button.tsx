'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ApproveTestimonialButton({ id, approved }: { id: string; approved: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const toggle = () => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase
        .from('testimonials')
        .update({ approved: !approved })
        .eq('id', id)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : approved ? (
        <button
          onClick={toggle}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20 transition-colors"
          title="Klik untuk cabut persetujuan"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Disetujui
        </button>
      ) : (
        <button
          onClick={toggle}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 transition-colors"
          title="Klik untuk setujui"
        >
          <XCircle className="h-3.5 w-3.5" />
          Setujui
        </button>
      )}
    </div>
  )
}
