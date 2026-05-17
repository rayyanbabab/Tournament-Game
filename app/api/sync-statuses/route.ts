import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('sync_tournament_statuses')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ updated: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
