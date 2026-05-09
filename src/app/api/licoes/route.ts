import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { course_id, title, unlock_after_days, order_index, status } = await request.json()

    if (!course_id || !title) {
      return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        course_id,
        title,
        unlock_after_days: unlock_after_days || 0,
        order_index: order_index || 0,
        status: status || 'draft',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ lesson }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const course_id = searchParams.get('course_id')

  if (!course_id) return NextResponse.json({ error: 'course_id obrigatorio' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*, lesson_contents(*)')
    .eq('course_id', course_id)
    .order('order_index', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ lessons })
}
