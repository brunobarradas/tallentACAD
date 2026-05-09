import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ role: null }, { status: 401 })
    }

    // Usar admin client para evitar RLS
    const admin = createAdminClient()
    const { data: dbUser } = await admin
      .from('users')
      .select('role, name, email')
      .eq('auth_user_id', user.id)
      .single()

    return NextResponse.json({
      role: dbUser?.role || 'student',
      name: dbUser?.name,
      email: dbUser?.email,
    })
  } catch {
    return NextResponse.json({ role: 'student' }, { status: 200 })
  }
}
