import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  ArrowLeft, Users, Crown, Mail, Phone, Calendar,
  Trophy, Shield, Hash, ExternalLink,
} from 'lucide-react'

export default async function AdminTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch team with all related data
  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      *,
      captain:profiles!teams_captain_id_fkey(id, full_name, email),
      team_members(
        id, role, joined_at,
        player:profiles!team_members_user_id_fkey(id, full_name, email)
      )
    `)
    .eq('id', teamId)
    .single()

  if (error || !team) notFound()

  // Fetch tournament registrations for this team
  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      id, status, registered_at,
      tournament:tournaments(id, name, game, start_date)
    `)
    .eq('team_id', teamId)
    .order('registered_at', { ascending: false })

  const memberCount = team.team_members?.length ?? 0

  const statusBadge: Record<string, { label: string; cls: string }> = {
    pending:  { label: 'Menunggu',  cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    approved: { label: 'Disetujui', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    rejected: { label: 'Ditolak',   cls: 'bg-red-500/10 text-red-600 border-red-500/20' },
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6 gap-3">
          <Link
            href="/admin/teams"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Daftar Tim
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-xs font-medium text-foreground truncate">{team.name}</span>
        </header>

        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 space-y-6 max-w-5xl">
          {/* Mobile back */}
          <Link
            href="/admin/teams"
            className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          {/* Team Header Card */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

            <div className="px-6 pb-6 -mt-12">
              <div className="flex items-end gap-4 mb-4">
                {/* Logo */}
                <div className="h-20 w-20 rounded-2xl border-4 border-card bg-primary/10 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{team.name[0].toUpperCase()}</span>
                  )}
                </div>

                {/* Name + meta */}
                <div className="pb-1 min-w-0">
                  <h1 className="text-xl font-bold text-foreground">{team.name}</h1>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {memberCount} anggota
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(team.created_at), 'dd MMM yyyy', { locale: id })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Hash className="h-3.5 w-3.5" />
                      <span className="font-mono">{teamId.slice(0, 8)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {team.description && (
                <p className="text-sm text-muted-foreground">{team.description}</p>
              )}

              {/* Contact info */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/60">
                {team.contact_email && (
                  <a href={`mailto:${team.contact_email}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {team.contact_email}
                  </a>
                )}
                {team.contact_phone && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {team.contact_phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Members List */}
            <div className="md:col-span-2 rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Anggota Tim
                </h2>
                <span className="text-xs text-muted-foreground">{memberCount} orang</span>
              </div>

              <div className="divide-y divide-border/60">
                {/* Captain first */}
                {team.captain && (
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <span className="text-xs font-bold text-amber-600">
                        {(team.captain.full_name || team.captain.email || 'K')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {team.captain.full_name || 'Tanpa Nama'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{team.captain.email}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                      <Crown className="h-3 w-3" />
                      Kapten
                    </span>
                  </div>
                )}

                {/* Other members */}
                {team.team_members
                  ?.filter((m: any) => m.player?.id !== team.captain?.id)
                  .map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/60">
                        <span className="text-xs font-bold text-muted-foreground">
                          {(member.player?.full_name || member.player?.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.player?.full_name || 'Tanpa Nama'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{member.player?.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.role || 'Anggota'}
                      </span>
                    </div>
                  ))}

                {memberCount === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Belum ada anggota
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Stats */}
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Statistik
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Turnamen</span>
                    <span className="font-semibold">{registrations?.length ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disetujui</span>
                    <span className="font-semibold text-emerald-600">
                      {registrations?.filter((r: any) => r.status === 'approved').length ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Menunggu</span>
                    <span className="font-semibold text-amber-600">
                      {registrations?.filter((r: any) => r.status === 'pending').length ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Anggota</span>
                    <span className="font-semibold">{memberCount}</span>
                  </div>
                </div>
              </div>

              {/* Tournament history */}
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border/60">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    Riwayat Turnamen
                  </h2>
                </div>

                <div className="divide-y divide-border/60">
                  {registrations && registrations.length > 0 ? (
                    registrations.map((reg: any) => {
                      const badge = statusBadge[reg.status] ?? statusBadge.pending
                      return (
                        <div key={reg.id} className="px-5 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                href={`/admin/tournaments/${reg.tournament?.id}`}
                                className="text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 truncate"
                              >
                                {reg.tournament?.name}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </Link>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {reg.tournament?.game}
                              </p>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {format(new Date(reg.registered_at), 'dd MMM yyyy', { locale: id })}
                          </p>
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-5 py-6 text-center text-xs text-muted-foreground">
                      Belum ada riwayat turnamen
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
