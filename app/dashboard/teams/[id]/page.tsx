import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Users, Crown, User, Trophy, Calendar,
  Mail, Phone, Info, ChevronRight, Shield, Plus,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AddMemberDialog } from './add-member-dialog'
import { RemoveMemberButton } from './remove-member-button'
import { UserSidebar } from '@/components/user/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: teamId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: team, error } = await supabase
    .from('teams')
    .select('*, captain:profiles!teams_captain_id_fkey(id, full_name, email)')
    .eq('id', teamId)
    .single()

  if (error || !team) notFound()

  const { data: members } = await supabase
    .from('team_members')
    .select('*, profiles(id, full_name, email)')
    .eq('team_id', teamId)
    .order('role', { ascending: false })

  const isCaptain = team.captain_id === user.id
  const isMember = members?.some(m => m.user_id === user.id)

  if (!isCaptain && !isMember) redirect('/dashboard')

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(name, game, start_date, status)')
    .eq('team_id', teamId)
    .order('registered_at', { ascending: false })

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pending:   { label: 'Menunggu',   bg: 'bg-amber-500/10',   text: 'text-amber-600',   border: 'border-amber-500/20' },
    approved:  { label: 'Disetujui',  bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
    rejected:  { label: 'Ditolak',    bg: 'bg-red-500/10',     text: 'text-red-600',     border: 'border-red-500/20' },
    withdrawn: { label: 'Dibatalkan', bg: 'bg-muted/40',       text: 'text-muted-foreground', border: 'border-border/40' },
  }

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard/teams" className="text-muted-foreground hover:text-foreground transition-colors">
              Tim Saya
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{team.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            {isCaptain && <AddMemberDialog teamId={teamId} />}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pt-16 md:pt-6">

          {/* Back link */}
          <Link href="/dashboard/teams"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Tim Saya
          </Link>

          {/* Team Header Card */}
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-primary">{team.name[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{team.name}</h1>
                    {isCaptain && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Crown className="h-3 w-3" />Kapten
                      </span>
                    )}
                    {!isCaptain && isMember && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        <Shield className="h-3 w-3" />Anggota
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Dibuat {format(new Date(team.created_at), 'dd MMM yyyy', { locale: id })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {members?.length || 0} anggota
                    </span>
                  </div>

                  {/* Contact info */}
                  {(team.contact_email || team.whatsapp_number) && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {team.contact_email && (
                        <a href={`mailto:${team.contact_email}`}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 bg-muted/30 hover:bg-muted/60 px-2.5 py-1.5 rounded-lg transition-all">
                          <Mail className="h-3.5 w-3.5" />{team.contact_email}
                        </a>
                      )}
                      {team.whatsapp_number && (
                        <a href={`https://wa.me/${team.whatsapp_number.replace(/[^0-9]/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-all">
                          <Phone className="h-3.5 w-3.5" />{team.whatsapp_number}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {team.description && (
              <div className="mt-5 pt-5 border-t border-border/40">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tentang Tim</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{team.description}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Members Card */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Anggota Tim</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{members?.length || 0} anggota terdaftar</p>
                  </div>
                  {isCaptain && (
                    <div className="md:hidden">
                      <AddMemberDialog teamId={teamId} />
                    </div>
                  )}
                </div>
                <div className="divide-y divide-border/40">
                  {members?.map((member: any) => (
                    <div key={member.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          member.role === 'captain'
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : 'bg-muted/60 border border-border/40'
                        }`}>
                          {member.role === 'captain' ? (
                            <Crown className="h-4 w-4 text-amber-500" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.in_game_name || member.profiles?.full_name || member.profiles?.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.in_game_id ? `Game ID: ${member.in_game_id}` : member.profiles?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          member.role === 'captain'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-muted/40 text-muted-foreground border-border/40'
                        }`}>
                          {member.role === 'captain' ? 'Kapten' : 'Anggota'}
                        </span>
                        {isCaptain && member.role !== 'captain' && (
                          <RemoveMemberButton memberId={member.id} memberName={member.profiles?.full_name} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tournament Registrations Sidebar */}
            <div>
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Turnamen Diikuti</h2>
                    <p className="text-xs text-muted-foreground">{registrations?.length || 0} pendaftaran</p>
                  </div>
                </div>

                {registrations && registrations.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {registrations.map((reg: any) => {
                      const cfg = statusConfig[reg.status] ?? statusConfig.pending
                      return (
                        <div key={reg.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {reg.tournaments?.game}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">{reg.tournaments?.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(reg.tournaments?.start_date), 'dd MMM yyyy', { locale: id })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-4 gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-amber-500/30" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Belum ada turnamen</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Daftarkan tim ke turnamen sekarang</p>
                    </div>
                    <Button asChild size="sm" className="gap-1.5">
                      <Link href="/tournaments"><Plus className="h-3.5 w-3.5" />Cari Turnamen</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
