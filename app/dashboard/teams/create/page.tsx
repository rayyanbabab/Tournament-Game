'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Users, Upload, Image as ImageIcon, Phone, Mail, Info } from 'lucide-react'
import { UserSidebar } from '@/components/user/sidebar'

export default function CreateTeamPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 2MB')
        return
      }
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
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

      // 1. Upload logo if provided
      let logoUrl = null
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('team_logos')
          .upload(fileName, logoFile)

        if (uploadError) {
          toast.error('Gagal mengunggah logo tim. Pastikan ukuran file tidak terlalu besar.')
          setLoading(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('team_logos')
          .getPublicUrl(fileName)
          
        logoUrl = publicUrl
      }

      // 2. Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          description: description || null,
          contact_email: contactEmail || null,
          whatsapp_number: whatsappNumber || null,
          logo_url: logoUrl,
          captain_id: user.id,
        })
        .select()
        .single()

      if (teamError) {
        console.error(teamError)
        toast.error('Gagal membuat tim. Mungkin kolom database belum diperbarui.')
        setLoading(false)
        return
      }

      // 3. Add captain as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'captain',
        })

      if (memberError) {
        toast.error('Tim dibuat tapi gagal menambahkan Anda sebagai kapten.')
      } else {
        toast.success('Tim berhasil dibuat!')
      }
      
      router.push(`/dashboard/teams/${team.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Terjadi kesalahan yang tidak terduga saat membuat tim.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex sticky top-0 z-30 h-16 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground -ml-1">
            <Link href="/dashboard/teams">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Tim Saya
            </Link>
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Buat Tim Baru</h1>
              <p className="text-sm text-muted-foreground mt-1">Lengkapi informasi tim Anda untuk mulai berkompetisi di turnamen.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Informasi Dasar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Logo */}
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary/50">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <label htmlFor="logo-upload" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors shadow-sm ring-2 ring-background">
                        <Upload className="h-4 w-4" />
                        <span className="sr-only">Upload Logo</span>
                      </label>
                      <input 
                        id="logo-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base">Logo Tim</Label>
                      <p className="text-xs text-muted-foreground max-w-[250px]">Upload foto atau logo tim Anda. Format yang didukung: JPG, PNG. Maksimal 2MB.</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="name">Nama Tim <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Evos Esports"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi Tim</Label>
                    <Textarea
                      id="description"
                      placeholder="Ceritakan sedikit tentang tim Anda, visi, atau game yang difokuskan..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      disabled={loading}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Kontak & Sosial</CardTitle>
                  <CardDescription className="text-xs">Informasi ini membantu penyelenggara turnamen menghubungi tim Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email Kontak</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contact_email"
                          type="email"
                          placeholder="email@tim.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          disabled={loading}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="whatsapp_number"
                          type="tel"
                          placeholder="08123456789"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          disabled={loading}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading || !name.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Buat Tim Sekarang'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
