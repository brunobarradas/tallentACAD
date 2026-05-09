import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lesson_id = searchParams.get('lesson_id')
  if (!lesson_id) return NextResponse.json({ error: 'lesson_id obrigatorio' }, { status: 400 })
  const supabase = createAdminClient()
  const { data: contents, error } = await supabase.from('lesson_contents').select('*').eq('lesson_id', lesson_id).order('order_index', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ contents })
}

export async function POST(request: NextRequest) {
  try {
    const { lesson_id, type, url, filename, order_index } = await request.json()
    if (!lesson_id || !type || !url) return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    const supabase = createAdminClient()
    const { data: content, error } = await supabase.from('lesson_contents').insert({ lesson_id, type, url, filename, order_index: order_index || 0 }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ content }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
