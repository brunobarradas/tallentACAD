import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any })

export async function POST(request: NextRequest) {
  try {
    const { nome, email, password, curso_slug } = await request.json()

    if (!nome || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    }

    const supabase = createAdminClient()

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

    // Criar user na tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user!.id,
        email,
        name: nome,
        role: 'student',
        status: 'active',
      })
      .select()
      .single()

    if (userError || !user) {
      await supabase.auth.admin.deleteUser(authData.user!.id)
      return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 })
    }

    // Se veio de um curso especifico
    if (curso_slug) {
      const { data: course } = await supabase
        .from('courses')
        .select('id, title, type, price, access_days')
        .eq('slug', curso_slug)
        .eq('status', 'published')
        .single()

      if (course) {
        // Curso pago — redirecionar para pagamento
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
            customer_email: email,
            metadata: {
              type: 'student_enrollment',
              course_id: course.id,
              user_id: user.id,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/area?enrolled=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/curso/${curso_slug}`,
          })

          return NextResponse.json({ payment_url: session.url })
        }

        // Curso gratuito — inscrever diretamente
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + (course.access_days || 90))

        await supabase.from('enrollments').insert({
          course_id: course.id,
          user_id: user.id,
          expires_at: expiresAt.toISOString(),
          status: 'active',
        })
      }
    }

    // Enviar email de boas vindas
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@tallentacad.com',
        to: email,
        subject: 'Bem-vindo ao TallentAcad',
        html: `<h2>Bem-vindo, ${nome}!</h2><p>A sua conta foi criada com sucesso.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/area">Aceder aos seus cursos</a></p>`,
      }),
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
