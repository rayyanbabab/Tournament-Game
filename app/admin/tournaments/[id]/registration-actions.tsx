'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Check, X } from 'lucide-react'

interface RegistrationActionsProps {
  registrationId: string
}

export function RegistrationActions({ registrationId }: RegistrationActionsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(action)

    try {
      const status = action === 'approve' ? 'approved' : 'rejected'

      const { error } = await supabase
        .from('tournament_registrations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', registrationId)

      if (error) {
        toast.error(error.message)
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
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
        onClick={() => handleAction('approve')}
        disabled={loading !== null}
      >
        {loading === 'approve' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => handleAction('reject')}
        disabled={loading !== null}
      >
        {loading === 'reject' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
