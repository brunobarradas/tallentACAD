import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  // Buscar estatisticas reais
  const [
    { count: totalTenants },
    { count: totalCourses },
    { count: totalEnrollments },
    { data: recentTenants },
    { data: recentCourses },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }).neq('is_owner', true),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('tenants').select('id, name, slug, status, created_at').neq('is_owner', true).order('created_at', { ascending: false }).limit(5),
    supabase.from('courses').select('id, title, status, created_at, tenants(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('plans').select('amount').order('paid_at', { ascending: false }),
  ])

  const totalReceita = recentPayments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0

  const badgeColor: Record<string, string> = {
    active: '#dcfce7', trial: '#dbeafe', blocked: '#fee2e2', suspended: '#f3f4f6',
    published: '#dcfce7', draft: '#f3f4f6', archived: '#fef3c7',
  }
  const badgeText: Record<string, string> = {
    active: '#16a34a', trial: '#1d4ed8', blocked: '#dc2626', suspended: '#6b7280',
    published: '#16a34a', draft: '#6b7280', archived: '#d97706',
  }
  const badgeLabel: Record<string, string> = {
    active: 'Ativo', trial: 'Trial', blocked: 'Bloqueado', suspended: 'Suspenso',
    published: 'Publicado', draft: 'Rascunho', archived: 'Arquivado',
  }

  const stats = [
    { label: 'Empresas', value: totalTenants || 0, delta: 'registadas', icon: '🏢' },
    { label: 'Cursos Ativos', value: totalCourses || 0, delta: 'criados', icon: '📚' },
    { label: 'Inscricoes', value: totalEnrollments || 0, delta: 'ativas', icon: '👥' },
    { label: 'Receita Total', value: `${totalReceita.toFixed(0)}€`, delta: 'acumulada', icon: '💶' },
  ]

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Dashboard</div>
        <Link href="/admin/empresas/nova" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Nova Empresa
        </Link>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8edf3' }}>
              <div style={{ float: 'right', fontSize: 24, opacity: 0.15 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', margin: '6px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#4a90d9', fontWeight: 600 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Tabelas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>Empresas Recentes</div>
            <div style={{ padding: '0 20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Empresa', 'Estado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '8px 0', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTenants && recentTenants.length > 0 ? recentTenants.map((t: any, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{t.name}</td>
                      <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[t.status] || '#f3f4f6', color: badgeText[t.status] || '#6b7280' }}>{badgeLabel[t.status] || t.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={2} style={{ padding: '16px 0', fontSize: 12, color: '#6b7280' }}>Nenhuma empresa registada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>Cursos Recentes</div>
            <div style={{ padding: '0 20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Curso', 'Estado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '8px 0', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentCourses && recentCourses.length > 0 ? recentCourses.map((c: any, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{c.title}</td>
                      <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[c.status] || '#f3f4f6', color: badgeText[c.status] || '#6b7280' }}>{badgeLabel[c.status] || c.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={2} style={{ padding: '16px 0', fontSize: 12, color: '#6b7280' }}>Nenhum curso criado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
