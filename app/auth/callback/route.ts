import { NextResponse } from 'next/server'

// Callback no longer needed with NextAuth credentials
// This redirects to home if someone visits this old URL
export async function GET() {
  return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
}
