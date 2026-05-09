import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any })

export async function POST(request: NextRequest) {
  try {
    const { course_slug } = await request.json()

    if (!course_slug) {
      return NextResponse.json({ error: 'course_slug obrigatorio' }, { status: 400 })
    }

    // Verificar se utilizador esta autenticado
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado', redirect: `/login?redirect=/curso/${course_slug}` }, { status: 401 })
    }

    const admin = createAdminClient()

    // Buscar utilizador na tabela users
    const { data: dbUser } = await admin
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'Utilizador nao encontrado' }, { status: 404 })
    }

    // Buscar curso
    const { data: course } = await admin
      .from('courses')
      .select('id, title, type, price, access_days, status')
      .eq('slug', course_slug)
      .single()

    if (!course || course.status !== 'published') {
      return NextResponse.json({ error: 'Curso nao encontrado' }, { status: 404 })
    }

    // Verificar se ja esta inscrito
    const { data: existing } = await admin
      .from('enrollments')
      .select('id')
      .eq('course_id', course.id)
      .eq('user_id', dbUser.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ja esta inscrito neste curso', enrolled: true }, { status: 409 })
    }

    // Curso pago — criar sessao Stripe
    if (course.type === 'paid' && course.price > 0) {
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
        customer_email: user.email,
        metadata: {
          type: 'student_enrollment',
          course_id: course.id,
          user_id: dbUser.id,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/area?enrolled=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/curso/${course_slug}`,
      })

      return NextResponse.json({ payment_url: session.url })
    }

    // Curso gratuito — inscrever diretamente
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (course.access_days || 90))

    await admin.from('enrollments').insert({
      course_id: course.id,
      user_id: dbUser.id,
      expires_at: expiresAt.toISOString(),
      status: 'active',
    })

    return NextResponse.json({ success: true, redirect: '/area' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
