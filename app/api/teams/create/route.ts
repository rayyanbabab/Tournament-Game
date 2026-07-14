import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

// POST /api/teams/create
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const { name, description, contactEmail, whatsappNumber, discordLink } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nama tim wajib diisi' }, { status: 400 })
    }

    const teams = await sql`
      INSERT INTO teams (name, description, contact_email, whatsapp_number, discord_link, captain_id)
      VALUES (${name.trim()}, ${description || null}, ${contactEmail || null}, ${whatsappNumber || null}, ${discordLink || null}, ${userId})
      RETURNING id
    `
    const teamId = teams[0].id

    // Add captain as member
    await sql`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (${teamId}, ${userId}, 'captain')
    `

    return NextResponse.json({ success: true, teamId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
