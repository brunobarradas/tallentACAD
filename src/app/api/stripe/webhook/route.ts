import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook invalido' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Record<string, any>
    const { type, course_id, user_id } = session.metadata || {}

    if (type === 'student_enrollment' && course_id && user_id) {
      const supabase = createAdminClient()

      const { data: course } = await supabase
        .from('courses')
        .select('access_days')
        .eq('id', course_id)
        .single()

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (course?.access_days || 90))

      await supabase.from('enrollments').insert({
        course_id,
        user_id,
        stripe_payment_id: session.payment_intent,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      })
    }
  }

  return NextResponse.json({ received: true })
}
