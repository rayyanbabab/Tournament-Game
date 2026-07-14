'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Loader2, ChevronDown } from 'lucide-react'

interface UpdateStatusButtonProps {
  tournamentId: string
  currentStatus: string
}

const statusOptions = [
  { value: 'upcoming', label: 'Segera' },
  { value: 'ongoing', label: 'Berlangsung' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

export function UpdateStatusButton({ tournamentId, currentStatus }: UpdateStatusButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === currentStatus) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tournament-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, status: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error || 'Terjadi kesalahan')
        return
      }
      toast.success('Status turnamen berhasil diperbarui')
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Ubah Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleUpdateStatus(option.value)}
            className={currentStatus === option.value ? 'bg-secondary' : ''}
          >
            {option.label}
            {currentStatus === option.value && ' (Aktif)'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
