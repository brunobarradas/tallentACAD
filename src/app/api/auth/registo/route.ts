import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { nome, slug, email, password, nif, telefone } = await request.json()

    if (!nome || !slug || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    }

    // Validar slug
    if (!/^[a-z0-9]+$/.test(slug)) {
      return NextResponse.json({ error: 'O identificador so pode conter letras minusculas e numeros' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verificar se slug ja existe
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Este identificador ja esta em uso. Escolha outro.' }, { status: 409 })
    }

    // Criar utilizador no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      if (authError?.message?.includes('already registered')) {
        return NextResponse.json({ error: 'Este email ja esta registado.' }, { status: 409 })
      }
      return NextResponse.json({ error: authError?.message || 'Erro ao criar utilizador' }, { status: 500 })
    }

    // Calcular fim do trial (15 dias)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 15)

    // Criar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        slug,
        name: nome,
        email,
        status: 'trial',
        is_owner: false,
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .select()
      .single()

    if (tenantError || !tenant) {
      // Reverter criacao do utilizador
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Erro ao criar entidade' }, { status: 500 })
    }

    // Criar limites do plano
    await supabase.from('plan_limits').insert({
      tenant_id: tenant.id,
      max_courses: 5,
      max_enrollments: 100,
      current_courses: 0,
      current_enrollments: 0,
    })

    // Criar utilizador admin da entidade
    await supabase.from('tenant_users').insert({
      tenant_id: tenant.id,
      auth_user_id: authData.user.id,
      email,
      name: nome,
      role: 'admin',
      status: 'active',
    })

    // Enviar email de boas vindas via Resend
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@tallentacad.com',
        to: email,
        subject: 'Bem-vindo ao TallentAcad — Trial iniciado',
        html: `
          <h2>Bem-vindo ao TallentAcad, ${nome}!</h2>
          <p>O seu trial gratuito de 15 dias foi iniciado com sucesso.</p>
          <p>Tem acesso a:</p>
          <ul>
            <li>5 cursos</li>
            <li>100 formandos</li>
          </ul>
          <p>O seu espaco na plataforma: <a href="https://tallentacad.com/${slug}">tallentacad.com/${slug}</a></p>
          <p>Painel de gestao: <a href="https://tallentacad.com/admin">tallentacad.com/admin</a></p>
          <p>O trial termina em ${trialEndsAt.toLocaleDateString('pt-PT')}.</p>
        `,
      }),
    }).catch(() => {}) // nao bloquear se email falhar

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
