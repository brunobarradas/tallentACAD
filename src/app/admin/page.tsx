import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: totalCourses },
    { count: totalUsers },
    { count: totalEnrollments },
    { data: payments },
    { data: recentUsers },
    { data: recentCourses },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('enrollments').select('courses(price)').eq('status', 'active').not('stripe_payment_id', 'is', null),
    supabase.from('users').select('id, name, email, created_at').eq('role', 'student').order('created_at', { ascending: false }).limit(5),
    supabase.from('courses').select('id, title, status, type, price').order('created_at', { ascending: false }).limit(5),
  ])

  const totalReceita = payments?.reduce((acc: number, e: any) => acc + (e.courses?.price || 0), 0) || 0

  const stats = [
    { label: 'Cursos', value: totalCourses || 0, icon: '📚', href: '/admin/cursos' },
    { label: 'Formandos', value: totalUsers || 0, icon: '👥', href: '/admin/formandos' },
    { label: 'Inscricoes Ativas', value: totalEnrollments || 0, icon: '✅', href: '/admin/formandos' },
    { label: 'Receita Total', value: `${totalReceita.toFixed(0)}€`, icon: '💶', href: '/admin/estatisticas' },
  ]

  const badgeColor: Record<string, string> = { published: '#dcfce7', draft: '#f3f4f6', archived: '#fef3c7', free: '#dcfce7', paid: '#dbeafe', sold: '#fef3c7' }
  const badgeText: Record<string, string> = { published: '#16a34a', draft: '#6b7280', archived: '#d97706', free: '#16a34a', paid: '#1d4ed8', sold: '#d97706' }
  const badgeLabel: Record<string, string> = { published: 'Publicado', draft: 'Rascunho', archived: 'Arquivado', free: 'Gratuito', paid: 'Pago', sold: 'Vendido' }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Dashboard</div>
        <Link href="/admin/cursos/novo" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Novo Curso
        </Link>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <Link key={i} href={s.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8edf3', cursor: 'pointer' }}>
                <div style={{ float: 'right', fontSize: 24, opacity: 0.15 }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', margin: '6px 0 2px' }}>{s.value}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Formandos recentes */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>Formandos Recentes</div>
              <Link href="/admin/formandos" style={{ fontSize: 11, color: '#4a90d9', textDecoration: 'none' }}>Ver todos</Link>
            </div>
            <div style={{ padding: '0 20px' }}>
              {recentUsers && recentUsers.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Nome', 'Email', 'Registado'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '8px 0', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u: any, i: number) => (
                      <tr key={i}>
                        <td style={{ padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{u.name}</td>
                        <td style={{ fontSize: 11, color: '#6b7280' }}>{u.email}</td>
                        <td style={{ fontSize: 11, color: '#6b7280' }}>{new Date(u.created_at).toLocaleDateString('pt-PT')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '24px 0', fontSize: 12, color: '#6b7280' }}>Nenhum formando registado ainda.</div>
              )}
            </div>
          </div>

          {/* Cursos recentes */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>Cursos Recentes</div>
              <Link href="/admin/cursos" style={{ fontSize: 11, color: '#4a90d9', textDecoration: 'none' }}>Ver todos</Link>
            </div>
            <div style={{ padding: '0 20px' }}>
              {recentCourses && recentCourses.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Curso', 'Tipo', 'Estado'].map(h => (
                        <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '8px 0', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.map((c: any, i: number) => (
                      <tr key={i}>
                        <td style={{ padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{c.title}</td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[c.type] || '#f3f4f6', color: badgeText[c.type] || '#6b7280' }}>
                            {badgeLabel[c.type] || c.type}
                          </span>
                        </td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[c.status] || '#f3f4f6', color: badgeText[c.status] || '#6b7280' }}>
                            {badgeLabel[c.status] || c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '24px 0', fontSize: 12, color: '#6b7280' }}>Nenhum curso criado ainda.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
