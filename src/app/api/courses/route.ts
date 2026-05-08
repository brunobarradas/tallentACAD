import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { canCreateCourse } from '@/lib/limits'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, title, slug, description, language, starts_at, ends_at, access_days } = body

    if (!tenant_id || !title || !slug || !starts_at || !ends_at) {
      return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    }

    // Verificar se pode criar mais cursos
    const check = await canCreateCourse(tenant_id)
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 403 })
    }

    const supabase = createAdminClient()

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        tenant_id,
        title,
        slug,
        description,
        language: language || 'pt',
        starts_at,
        ends_at,
        access_days: access_days || 90,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ course }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenant_id = searchParams.get('tenant_id')

  if (!tenant_id) {
    return NextResponse.json({ error: 'tenant_id obrigatorio' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('tenant_id', tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ courses })
}
