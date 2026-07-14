import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Check if email exists
    const existing = await sql`SELECT id FROM profiles WHERE email = ${email} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
    }

    const password_hash = await hash(password, 12)

    await sql`
      INSERT INTO profiles (email, password_hash, full_name, role)
      VALUES (${email}, ${password_hash}, ${full_name}, 'user')
    `

    return NextResponse.json({ success: true, message: 'Akun berhasil dibuat' })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
