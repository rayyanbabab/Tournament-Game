import { NextResponse, type NextRequest } from 'next/server'

// This file is kept for backwards compatibility.
// The actual middleware logic is now in /middleware.ts using NextAuth.
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request })
}
