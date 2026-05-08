import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { canCreateEnrollment } from '@/lib/limits'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, course_id, user_id } = body

    if (!tenant_id || !course_id || !user_id) {
      return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    }

    // Verificar se pode criar mais inscricoes
    const check = await canCreateEnrollment(tenant_id)
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Buscar dados do curso para calcular data de expiacao
    const { data: course } = await supabase
      .from('courses')
      .select('access_days')
      .eq('id', course_id)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Curso nao encontrado' }, { status: 404 })
    }

    // Calcular data de expiracao
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + course.access_days)

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        tenant_id,
        course_id,
        user_id,
        enrolled_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Formando ja inscrito neste curso' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenant_id = searchParams.get('tenant_id')
  const course_id = searchParams.get('course_id')

  if (!tenant_id) {
    return NextResponse.json({ error: 'tenant_id obrigatorio' }, { status: 400 })
  }

  const supabase = createAdminClient()

  let query = supabase
    .from('enrollments')
    .select(`
      *,
      tenant_users (id, name, email),
      courses (id, title, slug)
    `)
    .eq('tenant_id', tenant_id)
    .order('enrolled_at', { ascending: false })

  if (course_id) {
    query = query.eq('course_id', course_id)
  }

  const { data: enrollments, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ enrollments })
}
