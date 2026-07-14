'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Check, X } from 'lucide-react'

interface RegistrationActionsProps {
  registrationId: string
}

export function RegistrationActions({ registrationId }: RegistrationActionsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(action)
    try {
      const res = await fetch('/api/admin/registration-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, action }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error || 'Terjadi kesalahan')
        return
      }
      toast.success(action === 'approve' ? 'Pendaftaran disetujui' : 'Pendaftaran ditolak')
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-7 border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
        disabled={!!loading}
        onClick={() => handleAction('approve')}
      >
        {loading === 'approve' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
        Setujui
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 border-red-500/50 text-red-600 hover:bg-red-500/10"
        disabled={!!loading}
        onClick={() => handleAction('reject')}
      >
        {loading === 'reject' ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
        Tolak
      </Button>
    </div>
  )
}
