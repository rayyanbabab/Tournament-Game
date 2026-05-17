'use client'

import { useState, useTransition } from 'react'
import { Shuffle, RefreshCw, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateBracket, resetBracket } from './actions'
import { useRouter } from 'next/navigation'

interface Props { tournamentId: string; hasBracket: boolean; approvedCount: number }

export function GenerateBracketButton({ tournamentId, hasBracket, approvedCount }: Props) {
  const [msg, setMsg] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [isPending, start] = useTransition()
  const router = useRouter()

  const handleGenerate = () => start(async () => {
    const res = await generateBracket(tournamentId)
    if (res?.error) { setMsg(res.error); return }
    setMsg('')
    setConfirm(false)
    router.refresh()
  })

  const handleReset = () => start(async () => {
    await resetBracket(tournamentId)
    setConfirm(false)
    router.refresh()
  })

  if (approvedCount < 2) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Minimal 2 tim disetujui untuk generate bracket
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {msg && <p className="text-xs text-red-500">{msg}</p>}
      {hasBracket && (
        <>
          {confirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Reset bracket?</span>
              <Button size="sm" variant="destructive" disabled={isPending} onClick={handleReset} className="gap-1.5">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Reset
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirm(false)}>Batal</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => setConfirm(true)}>
              <RefreshCw className="h-3.5 w-3.5" />Reset Bracket
            </Button>
          )}
        </>
      )}
      <Button size="sm" disabled={isPending} onClick={handleGenerate} className="gap-1.5">
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shuffle className="h-3.5 w-3.5" />}
        {hasBracket ? 'Generate Ulang' : `Generate Bracket (${approvedCount} Tim)`}
      </Button>
    </div>
  )
}
