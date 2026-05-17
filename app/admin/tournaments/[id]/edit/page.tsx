'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Trophy } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/sidebar'

const gameOptions = [
  'Mobile Legends',
  'PUBG Mobile',
  'Free Fire',
  'Valorant',
  'Dota 2',
  'League of Legends',
  'CS:GO',
  'eFootball',
  'FIFA',
  'Other',
]

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_teams: 16,
    team_size: 5,
    prize_pool: '',
    registration_fee: '',
    location: '',
    contact_info: '',
    rules: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchTournament = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setFormData({
          name: data.name || '',
          game: data.game || '',
          description: data.description || '',
          start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : '',
          end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
          registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString().slice(0, 16) : '',
          max_teams: data.max_teams || 16,
          team_size: data.team_size || 5,
          prize_pool: data.prize_pool || '',
          registration_fee: data.registration_fee || '',
          location: data.location || '',
          contact_info: data.contact_info || '',
          rules: data.rules || '',
        })
      }
    }
    fetchTournament()
  }, [id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Silakan login terlebih dahulu')
        router.push('/auth/login')
        return
      }

      let image_url = null

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('tournaments')
          .upload(filePath, imageFile)

        if (uploadError) {
          toast.error('Gagal mengupload foto. Pastikan bucket "tournaments" sudah dibuat dan public.')
          setLoading(false)
          return
        }
        
        const { data: { publicUrl } } = supabase.storage.from('tournaments').getPublicUrl(filePath)
        image_url = publicUrl
      }

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .update({
          ...formData,
          max_teams: Number(formData.max_teams),
          team_size: Number(formData.team_size),
          ...(image_url ? { image_url } : {}),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Turnamen berhasil diperbarui!')
      router.push(`/admin/tournaments/${id}`)
    } catch {
      toast.error('Terjadi kesalahan saat membuat turnamen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/admin/tournaments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Turnamen
          </Link>
        </Button>

        <Card className="border-border/50 max-w-3xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Edit Turnamen</CardTitle>
            <CardDescription>
              Ubah detail turnamen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Turnamen *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Contoh: Mobile Legends Championship 2024"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="game">Game *</Label>
                  <Select
                    value={formData.game}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, game: value }))}
                    required
                  >
                    <SelectTrigger id="game">
                      <SelectValue placeholder="Pilih game" />
                    </SelectTrigger>
                    <SelectContent>
                      {gameOptions.map((game) => (
                        <SelectItem key={game} value={game}>
                          {game}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Deskripsi singkat tentang turnamen"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Tanggal Mulai *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Tanggal Selesai *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Batas Pendaftaran *</Label>
                  <Input
                    id="registration_deadline"
                    name="registration_deadline"
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max_teams">Maksimal Tim *</Label>
                  <Input
                    id="max_teams"
                    name="max_teams"
                    type="number"
                    min="2"
                    value={formData.max_teams}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_size">Jumlah Pemain per Tim *</Label>
                  <Input
                    id="team_size"
                    name="team_size"
                    type="number"
                    min="1"
                    value={formData.team_size}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize_pool">Hadiah</Label>
                  <Input
                    id="prize_pool"
                    name="prize_pool"
                    placeholder="Contoh: Rp 10.000.000"
                    value={formData.prize_pool}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="registration_fee">Biaya Pendaftaran</Label>
                  <Input
                    id="registration_fee"
                    name="registration_fee"
                    placeholder="Contoh: Gratis atau Rp 50.000/Tim"
                    value={formData.registration_fee}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Banner / Foto Turnamen</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi Turnamen</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Contoh: Online / Offline di Jakarta"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_info">Info Kontak (WhatsApp/Discord)</Label>
                  <Input
                    id="contact_info"
                    name="contact_info"
                    placeholder="Contoh: WA 08123456789"
                    value={formData.contact_info}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Peraturan Turnamen</Label>
                <Textarea
                  id="rules"
                  name="rules"
                  placeholder="Tuliskan peraturan turnamen di sini..."
                  value={formData.rules}
                  onChange={handleChange}
                  rows={6}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading || !formData.name || !formData.game}>
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
