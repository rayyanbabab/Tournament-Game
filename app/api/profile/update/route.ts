import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { full_name, phone, avatar_url } = await request.json()

    await sql`
      UPDATE profiles
      SET
        full_name = ${full_name},
        phone = ${phone},
        avatar_url = ${avatar_url ?? null}
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
