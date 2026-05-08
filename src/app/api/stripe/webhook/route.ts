import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'
import { addExtraCapacity } from '@/lib/limits'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook invalido' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Record<string, any>
    const metadata = session.metadata || {}
    const { tenant_id, type, courses_added, students_added } = metadata

    if (!tenant_id) return NextResponse.json({ received: true })

    const supabase = createAdminClient()

    await supabase.from('plans').insert({
      tenant_id,
      stripe_payment_id: session.payment_intent as string,
      type,
      amount: (session.amount_total || 0) / 100,
      courses_added: parseInt(courses_added || '0'),
      students_added: parseInt(students_added || '0'),
      paid_at: new Date().toISOString()
    })

    if (type === 'base_plan') {
      const { data: existing } = await supabase
        .from('plan_limits')
        .select('id, max_courses, max_enrollments')
        .eq('tenant_id', tenant_id)
        .single()

      if (existing) {
        await supabase
          .from('plan_limits')
          .update({
            max_courses: existing.max_courses + 5,
            max_enrollments: existing.max_enrollments + 100,
            updated_at: new Date().toISOString()
          })
          .eq('tenant_id', tenant_id)
      } else {
        await supabase.from('plan_limits').insert({
          tenant_id,
          max_courses: 5,
          max_enrollments: 100,
        })
      }
    } else if (type === 'extra_course') {
      await addExtraCapacity(tenant_id, 'course', parseInt(courses_added || '1'))
    } else if (type === 'extra_student') {
      await addExtraCapacity(tenant_id, 'enrollment', parseInt(students_added || '1'))
    }

    await supabase
      .from('tenants')
      .update({ status: 'active' })
      .eq('id', tenant_id)
  }

  return NextResponse.json({ received: true })
}
