import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'
import { addExtraCapacity } from '@/lib/limits'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// Precos em centimos
const PRICES = {
  base_plan: 250000,       // 2500€ — plano base (5 cursos / 100 formandos)
  extra_course: 25000,     // 250€ por curso adicional
  extra_student: 4000,     // 40€ por formando adicional
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, type, quantity = 1 } = body

    if (!tenant_id || !type) {
      return NextResponse.json({ error: 'Campos obrigatorios em falta' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, email')
      .eq('id', tenant_id)
      .single()

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant nao encontrado' }, { status: 404 })
    }

    let amount: number
    let description: string
    let metadata: Record<string, string>

    switch (type) {
      case 'base_plan':
        amount = PRICES.base_plan
        description = 'TallentAcad — Plano Base (5 cursos / 100 formandos)'
        metadata = { tenant_id, type: 'base_plan', courses_added: '5', students_added: '100' }
        break
      case 'extra_course':
        amount = PRICES.extra_course * quantity
        description = `TallentAcad — ${quantity} curso(s) adicional(is)`
        metadata = { tenant_id, type: 'extra_course', courses_added: String(quantity), students_added: '0' }
        break
      case 'extra_student':
        amount = PRICES.extra_student * quantity
        description = `TallentAcad — ${quantity} formando(s) adicional(is)`
        metadata = { tenant_id, type: 'extra_student', courses_added: '0', students_added: String(quantity) }
        break
      default:
        return NextResponse.json({ error: 'Tipo de pagamento invalido' }, { status: 400 })
    }

    // Criar sessao de pagamento no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: description },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: tenant.email,
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar sessao de pagamento' }, { status: 500 })
  }
}
