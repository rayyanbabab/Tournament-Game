import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Calendar, ArrowRight, Gamepad2, Shield, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Tournament } from '@/lib/types'
import { getTournamentStatus } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()
  
  const now = new Date().toISOString()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .gt('start_date', now)
    .order('start_date', { ascending: true })
    .limit(3)

  const { count: totalTournaments } = await supabase
    .from('tournaments')
    .select('*', { count: 'exact', head: true })

  const { count: totalTeams } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                Platform Turnamen #1 di Indonesia
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
                Bergabung dan Kompetisi di
                <span className="text-primary"> Turnamen Game </span>
                Terbaik
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                Daftarkan tim Anda, ikuti turnamen seru, dan buktikan kemampuan gaming Anda. 
                Platform terpercaya untuk para gamer sejati.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-base">
                  <Link href="/tournaments">
                    Lihat Turnamen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base">
                  <Link href="/auth/signup">
                    Daftar Sekarang
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalTournaments || 0}+</p>
                <p className="text-muted-foreground">Turnamen Diselenggarakan</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalTeams || 0}+</p>
                <p className="text-muted-foreground">Tim Terdaftar</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Gamepad2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalUsers || 0}+</p>
                <p className="text-muted-foreground">Pemain Aktif</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Mengapa Memilih GameArena?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Platform lengkap untuk mengelola tim dan mengikuti turnamen game online
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-2">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Pendaftaran Mudah</CardTitle>
                  <CardDescription>
                    Proses pendaftaran yang cepat dan sederhana. Buat tim, undang anggota, dan daftar turnamen dalam hitungan menit.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/50">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-2">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Sistem Terverifikasi</CardTitle>
                  <CardDescription>
                    Semua pendaftaran diverifikasi oleh admin untuk menjamin kompetisi yang fair dan profesional.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/50">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-2">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Hadiah Menarik</CardTitle>
                  <CardDescription>
                    Berbagai turnamen dengan hadiah menarik. Buktikan skill Anda dan menangkan hadiah utama!
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Upcoming Tournaments */}
        <section className="py-20 bg-card border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Turnamen Mendatang</h2>
                <p className="text-muted-foreground">Daftar sekarang sebelum slot habis!</p>
              </div>
              <Button asChild variant="outline" className="mt-4 md:mt-0">
                <Link href="/tournaments">
                  Lihat Semua
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {tournaments && tournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament: Tournament) => (
                  <Card key={tournament.id} className="border-border/50 overflow-hidden hover:shadow-lg transition-shadow">
                    {tournament.image_url ? (
                      <div className="h-40 relative overflow-hidden bg-muted/30 p-2">
                        <img src={tournament.image_url} alt={tournament.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Gamepad2 className="h-16 w-16 text-primary/50" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{tournament.game}</Badge>
                        <Badge variant="outline" className="text-primary border-primary">
                          {getTournamentStatus(tournament) === 'upcoming' ? 'Segera' : 'Pendaftaran Tutup'}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-1">{tournament.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {tournament.description || 'Turnamen seru dengan hadiah menarik!'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(tournament.start_date), 'dd MMMM yyyy', { locale: id })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Max {tournament.max_teams} tim ({tournament.team_size} pemain/tim)</span>
                        </div>
                        {tournament.prize_pool && (
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <Trophy className="h-4 w-4" />
                            <span>{tournament.prize_pool}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/tournaments/${tournament.id}`}>
                          Lihat Detail
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada turnamen yang akan datang.</p>
                  <p className="text-sm text-muted-foreground mt-1">Cek kembali nanti atau daftar untuk mendapat notifikasi.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">Siap Berkompetisi?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Bergabunglah dengan ribuan gamer lainnya. Buat akun gratis dan mulai perjalanan kompetitif Anda hari ini!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/auth/signup">
                      Daftar Gratis
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/tournaments">
                      Jelajahi Turnamen
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
