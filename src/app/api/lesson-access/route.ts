import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// Registar acesso a uma licao
export async function POST(request: NextRequest) {
  try {
    const { enrollment_id, lesson_id } = await request.json()
    if (!enrollment_id || !lesson_id) return NextResponse.json({ error: 'Campos obrigatorios' }, { status: 400 })

    const supabase = createAdminClient()

    // Criar registo de acesso se nao existir
    const { data: existing } = await supabase
      .from('lesson_access')
      .select('id')
      .eq('enrollment_id', enrollment_id)
      .eq('lesson_id', lesson_id)
      .single()

    if (!existing) {
      await supabase.from('lesson_access').insert({
        enrollment_id,
        lesson_id,
        unlocked_at: new Date().toISOString(),
        is_completed: false,
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Marcar licao como concluida
export async function PATCH(request: NextRequest) {
  try {
    const { enrollment_id, lesson_id } = await request.json()
    if (!enrollment_id || !lesson_id) return NextResponse.json({ error: 'Campos obrigatorios' }, { status: 400 })

    const supabase = createAdminClient()

    await supabase
      .from('lesson_access')
      .upsert({
        enrollment_id,
        lesson_id,
        unlocked_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        is_completed: true,
      }, { onConflict: 'enrollment_id,lesson_id' })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
