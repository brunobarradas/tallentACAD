import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: invite, error } = await supabase
    .from('invites')
    .select('*, courses(id, title, paid_by, price), tenants(slug, name)')
    .eq('token', token)
    .single()

  if (error || !invite) {
    return NextResponse.json({ error: 'Convite nao encontrado' }, { status: 404 })
  }

  if (invite.used) {
    return NextResponse.json({ error: 'Este convite ja foi utilizado' }, { status: 410 })
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Este convite expirou' }, { status: 410 })
  }

  return NextResponse.json({ invite })
}
