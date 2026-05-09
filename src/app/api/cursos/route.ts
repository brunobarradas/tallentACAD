import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, description, type, price, starts_at, ends_at, access_days, language } = body

    if (!title || !slug || !starts_at || !ends_at) {
      return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase.from('courses').select('id').eq('slug', slug).single()
    if (existing) return NextResponse.json({ error: 'Ja existe um curso com este slug' }, { status: 409 })

    const { data: course, error } = await supabase
      .from('courses')
      .insert({ title, slug, description, type, price: price || 0, starts_at, ends_at, access_days: access_days || 90, language: language || 'pt', status: 'draft' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ course }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = createAdminClient()
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ courses })
}
