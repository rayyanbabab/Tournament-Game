import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

// DELETE team member
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { memberId } = await request.json()
    await sql`DELETE FROM team_members WHERE id = ${memberId}`
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST add team member
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { teamId, userId, inGameName, inGameId } = await request.json()
    const result = await sql`
      INSERT INTO team_members (team_id, user_id, in_game_name, in_game_id, role)
      VALUES (${teamId}, ${userId}, ${inGameName || null}, ${inGameId || null}, 'member')
      RETURNING id
    `
    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error: any) {
    if (error.message?.includes('unique') || error.code === '23505') {
      return NextResponse.json({ error: 'Pengguna sudah menjadi anggota tim' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
