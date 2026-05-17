import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { TournamentChat } from '@/components/tournament-chat'
import { ArrowLeft, Lock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function TournamentChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tournamentId } = await params
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from('tournaments').select('id, name, game').eq('id', tournamentId).single()
  if (!tournament) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?next=/tournaments/${tournamentId}/chat`)
  }

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  const isAdmin = profile?.role === 'admin'

  // Check if user has approved registration
  const { data: reg } = await supabase
    .from('tournament_registrations')
    .select('id, status')
    .eq('tournament_id', tournamentId)
    .eq('registered_by', user.id)
    .maybeSingle()

  const isParticipant = reg?.status === 'approved'
  const canChat = isAdmin || isParticipant

  // Fetch initial messages
  let initialMessages: any[] = []
  if (canChat) {
    const { data } = await supabase
      .from('tournament_messages')
      .select('*, profiles:user_id(full_name, avatar_url, role)')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: true })
      .limit(100)
    initialMessages = data ?? []
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke {tournament.name}
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-foreground">Lobby Chat</h1>
              <p className="text-sm text-muted-foreground">{tournament.name} · {tournament.game}</p>
            </div>
          </div>

          {canChat ? (
            <TournamentChat
              tournamentId={tournamentId}
              initialMessages={initialMessages}
              currentUserId={user.id}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Akses Dibatasi</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {!reg
                    ? 'Kamu belum mendaftar di turnamen ini.'
                    : 'Pendaftaranmu sedang menunggu persetujuan admin.'}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Chat hanya tersedia untuk peserta yang telah disetujui.
                </p>
              </div>
              {!reg && (
                <Button asChild className="mt-2">
                  <Link href={`/tournaments/${tournamentId}`}>Daftar Sekarang</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
