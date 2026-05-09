import { createServerSupabaseClient } from '@/lib/supabase'

export default async function AdminEstatisticasPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: totalCourses },
    { count: totalUsers },
    { count: totalEnrollments },
    { count: totalFree },
    { count: totalPaid },
    { data: payments },
    { data: topCourses },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('enrollments').select('*, courses!inner(type)', { count: 'exact', head: true }).eq('courses.type', 'free'),
    supabase.from('enrollments').select('*, courses!inner(type)', { count: 'exact', head: true }).eq('courses.type', 'paid'),
    supabase.from('enrollments').select('courses(price)').eq('status', 'active').not('stripe_payment_id', 'is', null),
    supabase.from('courses').select('id, title, type, price').eq('status', 'published').limit(10),
  ])

  const totalReceita = payments?.reduce((acc: number, e: any) => acc + (e.courses?.price || 0), 0) || 0

  const stats = [
    { label: 'Cursos Publicados', value: totalCourses || 0, icon: '📚' },
    { label: 'Formandos Registados', value: totalUsers || 0, icon: '👥' },
    { label: 'Inscricoes Ativas', value: totalEnrollments || 0, icon: '✅' },
    { label: 'Gratuitas', value: totalFree || 0, icon: '🎁' },
    { label: 'Pagas', value: totalPaid || 0, icon: '💳' },
    { label: 'Receita Total', value: `${totalReceita.toFixed(0)}€`, icon: '💶' },
  ]

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Estatisticas</div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8edf3' }}>
              <div style={{ float: 'right', fontSize: 22, opacity: 0.15 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', margin: '6px 0 0' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
