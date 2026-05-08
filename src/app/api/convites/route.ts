import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { canCreateEnrollment } from '@/lib/limits'

// Gerar convite
export async function POST(request: NextRequest) {
  try {
    const { tenant_id, course_id, email } = await request.json()

    if (!tenant_id || !course_id) {
      return NextResponse.json({ error: 'tenant_id e course_id obrigatorios' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verificar se curso pertence ao tenant
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, paid_by, price, tenant_id')
      .eq('id', course_id)
      .eq('tenant_id', tenant_id)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Curso nao encontrado' }, { status: 404 })
    }

    // Se empresa paga, verificar limites ja aqui
    if (course.paid_by === 'company') {
      const check = await canCreateEnrollment(tenant_id)
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason }, { status: 403 })
      }
    }

    // Gerar token unico
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Expirar em 30 dias
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data: invite, error } = await supabase
      .from('invites')
      .insert({
        tenant_id,
        course_id,
        email: email || null,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/convite/${token}`

    // Enviar email se destinatario definido
    if (email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@tallentacad.com',
          to: email,
          subject: `Convite para o curso: ${course.title}`,
          html: `
            <h2>Foi convidado para o curso "${course.title}"</h2>
            <p>Clique no link abaixo para aceitar o convite${course.paid_by === 'student' ? ' e efetuar o pagamento' : ''}:</p>
            <p><a href="${link}" style="background:#f5a623;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Aceitar convite</a></p>
            <p>Este link expira em 30 dias.</p>
          `,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ invite, link }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Listar convites de um tenant
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenant_id = searchParams.get('tenant_id')

  if (!tenant_id) {
    return NextResponse.json({ error: 'tenant_id obrigatorio' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: invites, error } = await supabase
    .from('invites')
    .select('*, courses(title)')
    .eq('tenant_id', tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ invites })
}
