'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, User, Phone, Mail, Camera } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  initialProfile: Profile
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatar_url)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 2MB')
        return
      }
      setAvatarPreview(URL.createObjectURL(file))
      toast.info('Upload foto profil belum tersedia. Gunakan URL eksternal.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui profil')
      }

      toast.success('Profil berhasil diperbarui!')
      window.location.reload()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Terjadi kesalahan saat memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Foto Profil</CardTitle>
          <CardDescription className="text-xs">
            Format yang didukung: JPG, PNG. Maksimal 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary/50">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground/50" />
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors shadow-sm ring-2 ring-background">
              <Camera className="h-4 w-4" />
              <span className="sr-only">Upload Avatar</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Upload foto baru</p>
            <p className="text-xs text-muted-foreground max-w-[250px]">
              Foto akan ditampilkan di profil publik dan tim Anda.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={initialProfile.email}
                disabled
                className="pl-9 bg-muted/50"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Email terikat dengan akun dan tidak dapat diubah.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
      </div>
    </form>
  )
}
