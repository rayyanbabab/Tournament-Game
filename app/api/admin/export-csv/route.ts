import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const tournamentId = searchParams.get('tournamentId')
  if (!tournamentId) return NextResponse.json({ error: 'Missing tournamentId' }, { status: 400 })

  try {
    const rows = await sql`
      SELECT
        tr.status,
        tr.registered_at,
        t.name as team_name,
        t.contact_email,
        t.whatsapp_number,
        p.full_name as registered_by_name,
        p.email as registered_by_email
      FROM tournament_registrations tr
      LEFT JOIN teams t ON t.id = tr.team_id
      LEFT JOIN profiles p ON p.id = tr.registered_by
      WHERE tr.tournament_id = ${tournamentId}
      ORDER BY tr.registered_at ASC
    `
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
