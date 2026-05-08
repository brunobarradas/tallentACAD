import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { canCreateEnrollment } from '@/lib/limits'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any })

export async function POST(request: NextRequest) {
  try {
    const { token, nome, email, password } = await request.json()

    if (!token || !nome || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verificar convite
    const { data: invite } = await supabase
      .from('invites')
      .select('*, courses(id, title, paid_by, price, access_days), tenants(id, slug)')
      .eq('token', token)
      .single()

    if (!invite || invite.used) {
      return NextResponse.json({ error: 'Convite invalido ou ja utilizado' }, { status: 400 })
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Convite expirado' }, { status: 400 })
    }

    const tenant = Array.isArray(invite.tenants) ? invite.tenants[0] : invite.tenants as any
    const course = Array.isArray(invite.courses) ? invite.courses[0] : invite.courses as any

    // Verificar limites se empresa paga
    if (course.paid_by === 'company') {
      const check = await canCreateEnrollment(tenant.id)
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason }, { status: 403 })
      }
    }

    // Criar utilizador no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message?.includes('already registered')) {
        return NextResponse.json({ error: 'Este email ja esta registado.' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Criar tenant_user (formando)
    const { data: tenantUser } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        auth_user_id: authData.user!.id,
        email,
        name: nome,
        role: 'student',
        status: 'active',
      })
      .select()
      .single()

    if (!tenantUser) {
      return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 })
    }

    // Marcar convite como usado
    await supabase
      .from('invites')
      .update({ used: true, used_at: new Date().toISOString(), used_by: tenantUser.id })
      .eq('token', token)

    // Se formando paga — criar sessao Stripe
    if (course.paid_by === 'student' && course.price > 0) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Curso: ${course.title}` },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        customer_email: email,
        metadata: {
          type: 'student_enrollment',
          tenant_id: tenant.id,
          course_id: course.id,
          user_id: tenantUser.id,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${tenant.slug}?enrolled=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/convite/${token}?cancelled=true`,
      })

      return NextResponse.json({ payment_url: session.url })
    }

    // Se empresa paga — criar inscricao diretamente
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (course.access_days || 90))

    await supabase.from('enrollments').insert({
      tenant_id: tenant.id,
      course_id: course.id,
      user_id: tenantUser.id,
      enrolled_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
    })

    return NextResponse.json({ success: true, tenant_slug: tenant.slug })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
