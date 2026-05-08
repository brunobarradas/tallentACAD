import { createAdminClient } from './supabase'

// Verificar se tenant pode criar mais cursos
export async function canCreateCourse(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = createAdminClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('status, is_owner, trial_ends_at')
    .eq('id', tenantId)
    .single()

  if (!tenant) return { allowed: false, reason: 'Tenant nao encontrado' }

  // Owner nunca e bloqueado
  if (tenant.is_owner) return { allowed: true }

  // Verificar trial expirado
  if (tenant.status === 'trial' && tenant.trial_ends_at) {
    const trialEnd = new Date(tenant.trial_ends_at)
    if (new Date() > trialEnd) {
      return { allowed: false, reason: 'Trial expirado. Efetue o pagamento para continuar.' }
    }
  }

  // Verificar bloqueado
  if (tenant.status === 'blocked') {
    return { allowed: false, reason: 'Conta bloqueada. Contacte o suporte ou efetue um pagamento.' }
  }

  // Verificar limite de cursos
  const { data: limits } = await supabase
    .from('plan_limits')
    .select('max_courses, current_courses')
    .eq('tenant_id', tenantId)
    .single()

  if (!limits) return { allowed: false, reason: 'Limites nao encontrados' }

  if (limits.current_courses >= limits.max_courses) {
    return {
      allowed: false,
      reason: `Limite de ${limits.max_courses} cursos atingido. Adquira mais cursos para continuar.`
    }
  }

  // Alerta aos 4 cursos (80% do limite de 5)
  if (limits.current_courses >= limits.max_courses - 1) {
    await sendAlertEmail(tenantId, 'courses_alert', limits.current_courses, limits.max_courses)
  }

  return { allowed: true }
}

// Verificar se tenant pode criar mais inscricoes
export async function canCreateEnrollment(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = createAdminClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('status, is_owner, trial_ends_at')
    .eq('id', tenantId)
    .single()

  if (!tenant) return { allowed: false, reason: 'Tenant nao encontrado' }

  // Owner nunca e bloqueado
  if (tenant.is_owner) return { allowed: true }

  // Verificar trial expirado
  if (tenant.status === 'trial' && tenant.trial_ends_at) {
    const trialEnd = new Date(tenant.trial_ends_at)
    if (new Date() > trialEnd) {
      return { allowed: false, reason: 'Trial expirado. Efetue o pagamento para continuar.' }
    }
  }

  // Verificar bloqueado
  if (tenant.status === 'blocked') {
    return { allowed: false, reason: 'Conta bloqueada. Contacte o suporte ou efetue um pagamento.' }
  }

  // Verificar limite de inscricoes
  const { data: limits } = await supabase
    .from('plan_limits')
    .select('max_enrollments, current_enrollments')
    .eq('tenant_id', tenantId)
    .single()

  if (!limits) return { allowed: false, reason: 'Limites nao encontrados' }

  if (limits.current_enrollments >= limits.max_enrollments) {
    return {
      allowed: false,
      reason: `Limite de ${limits.max_enrollments} inscricoes atingido. Adquira mais formandos para continuar.`
    }
  }

  // Alerta aos 80 formandos (80% do limite de 100)
  if (limits.current_enrollments >= limits.max_enrollments - 20) {
    await sendAlertEmail(tenantId, 'enrollments_alert', limits.current_enrollments, limits.max_enrollments)
  }

  return { allowed: true }
}

// Enviar email de alerta (apenas uma vez por tipo)
async function sendAlertEmail(
  tenantId: string,
  type: 'courses_alert' | 'enrollments_alert',
  current: number,
  max: number
) {
  const supabase = createAdminClient()

  // Verificar se ja foi enviado este tipo de alerta
  const { data: existing } = await supabase
    .from('alert_logs')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('type', type)
    .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // ultima semana
    .single()

  if (existing) return // ja enviado recentemente

  // Buscar email do tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('email, name')
    .eq('id', tenantId)
    .single()

  if (!tenant) return

  // Registar o alerta
  await supabase.from('alert_logs').insert({
    tenant_id: tenantId,
    type,
    sent_at: new Date().toISOString()
  })

  // Enviar email via API (Resend)
  const subject = type === 'courses_alert'
    ? `TallentAcad: Esta perto do limite de cursos (${current}/${max})`
    : `TallentAcad: Esta perto do limite de formandos (${current}/${max})`

  const message = type === 'courses_alert'
    ? `A sua empresa ${tenant.name} ja utilizou ${current} dos ${max} cursos disponiveis. Quando atingir o limite, nao podera criar mais cursos sem adquirir capacidade adicional.`
    : `A sua empresa ${tenant.name} ja tem ${current} das ${max} inscricoes disponiveis. Quando atingir o limite, nao podera inscrever mais formandos sem adquirir capacidade adicional.`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@tallentacad.com',
      to: tenant.email,
      subject,
      html: `<p>${message}</p><p><a href="https://tallentacad.com/admin">Gerir a sua conta</a></p>`
    })
  })
}

// Registar novo tenant com trial de 15 dias
export async function createTenantWithTrial(data: {
  slug: string
  name: string
  email: string
}) {
  const supabase = createAdminClient()

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 15)

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      slug: data.slug,
      name: data.name,
      email: data.email,
      status: 'trial',
      is_owner: false,
      trial_ends_at: trialEndsAt.toISOString()
    })
    .select()
    .single()

  if (error || !tenant) throw new Error('Erro ao criar tenant')

  // Criar limites iniciais
  await supabase.from('plan_limits').insert({
    tenant_id: tenant.id,
    max_courses: 5,
    max_enrollments: 100,
    current_courses: 0,
    current_enrollments: 0
  })

  return tenant
}

// Adicionar capacidade extra apos pagamento
export async function addExtraCapacity(tenantId: string, type: 'course' | 'enrollment', quantity: number) {
  const supabase = createAdminClient()

  if (type === 'course') {
    await supabase.rpc('increment_plan_limit', {
      p_tenant_id: tenantId,
      p_field: 'max_courses',
      p_amount: quantity
    })
  } else {
    await supabase.rpc('increment_plan_limit', {
      p_tenant_id: tenantId,
      p_field: 'max_enrollments',
      p_amount: quantity
    })
  }

  // Reativar tenant se estava bloqueado
  await supabase
    .from('tenants')
    .update({ status: 'active' })
    .eq('id', tenantId)
    .eq('status', 'blocked')
}
