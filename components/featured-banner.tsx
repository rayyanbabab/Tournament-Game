import Link from 'next/link'
import { CountdownTimer } from '@/components/countdown-timer'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Calendar, ArrowRight, Flame, Star } from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface FeaturedTournament {
  id: string
  name: string
  game: string
  banner_url?: string | null
  cover_image_url?: string | null
  registration_deadline?: string | null
  start_date: string
  prize_pool?: string | null
  registration_fee?: string | null
  max_teams?: number | null
  _teamCount?: number
}

interface Props {
  tournament: FeaturedTournament
}

export function FeaturedBanner({ tournament }: Props) {
  const bgImage = tournament.banner_url || tournament.cover_image_url
  const deadline = tournament.registration_deadline || tournament.start_date

  return (
    <section className="relative w-full overflow-hidden min-h-[400px] md:min-h-[440px] flex items-center">
      {/* Background */}
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/30 to-slate-900" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </>
      )}

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-pulse"
            style={{
              width: `${20 + i * 15}px`,
              height: `${20 + i * 15}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 16}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 max-w-6xl py-16 md:py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/15 border border-amber-400/30 px-3 py-1.5 rounded-full backdrop-blur-sm animate-pulse">
              <Flame className="h-3 w-3" />
              FEATURED TOURNAMENT
            </span>
            <span className="text-xs font-medium text-white/60 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {tournament.game}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
            {tournament.name}
          </h1>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            {tournament.prize_pool && (
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Trophy className="h-3.5 w-3.5" />
                Prize: {tournament.prize_pool}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm font-medium text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(tournament.start_date), 'dd MMM yyyy', { locale: idLocale })}
            </div>
            {tournament.max_teams && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" />
                Maks {tournament.max_teams} Tim
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm font-medium text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              {tournament.registration_fee && !['gratis', '0', '-', 'free'].includes(tournament.registration_fee.toLowerCase())
                ? `Biaya: ${tournament.registration_fee}`
                : 'Gratis'}
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-8">
            <CountdownTimer
              targetDate={deadline}
              label="Pendaftaran ditutup dalam"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/tournaments/${tournament.id}`}>
              <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/30 group">
                Daftar Sekarang
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link href={`/tournaments/${tournament.id}`}>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold text-sm rounded-xl hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm">
                Lihat Detail
              </button>
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}
