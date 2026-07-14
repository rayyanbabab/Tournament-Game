import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

// POST /api/admin/registration-action
export async function POST(request: NextRequest) {
  const session = await auth()
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { registrationId, action } = await request.json()
    const status = action === 'approve' ? 'approved' : 'rejected'
    await sql`
      UPDATE tournament_registrations
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${registrationId}
    `
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
