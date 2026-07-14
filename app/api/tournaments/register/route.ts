import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

// POST /api/tournaments/register
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await request.json()
    const { tournamentId, teamName, members, isSolo, paymentProofUrl, paymentMethod, paymentBank } = body

    // Get profile for solo mode
    let finalTeamName = teamName
    if (isSolo) {
      const profiles = await sql`SELECT full_name FROM profiles WHERE id = ${userId} LIMIT 1`
      finalTeamName = profiles[0]?.full_name ?? `Player-${userId.slice(0, 6)}`
    }

    // Create team
    const newTeams = await sql`
      INSERT INTO teams (name, captain_id)
      VALUES (${finalTeamName}, ${userId})
      RETURNING id
    `
    const teamId = newTeams[0].id

    // Create team members
    if (members && members.length > 0) {
      for (let i = 0; i < members.length; i++) {
        const m = members[i]
        await sql`
          INSERT INTO team_members (team_id, user_id, in_game_name, in_game_id, role)
          VALUES (
            ${teamId},
            ${i === 0 ? userId : null},
            ${m.inGameName || (i === 0 ? finalTeamName : `Member ${i + 1}`)},
            ${m.inGameId || null},
            ${i === 0 ? 'captain' : 'member'}
          )
        `
      }
    }

    // Register tournament
    await sql`
      INSERT INTO tournament_registrations (tournament_id, team_id, registered_by, status, payment_proof_url)
      VALUES (${tournamentId}, ${teamId}, ${userId}, 'pending', ${paymentProofUrl || null})
    `

    return NextResponse.json({ success: true, teamId })
  } catch (error: any) {
    if (error.message?.includes('unique') || error.code === '23505') {
      return NextResponse.json({ error: 'Anda sudah terdaftar di turnamen ini' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
