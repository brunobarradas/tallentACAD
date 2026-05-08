import { createServerSupabaseClient } from '@/lib/supabase'

export default async function EstatisticasPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: totalTenants },
    { count: totalCourses },
    { count: totalEnrollments },
    { data: payments },
    { data: completions },
    { data: cursos },
  ] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }).neq('is_owner', true),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('plans').select('amount'),
    supabase.from('lesson_access').select('is_completed'),
    supabase.from('courses').select(`
      id, title,
      enrollments (count),
      lessons (count)
    `).order('created_at', { ascending: false }).limit(10),
  ])

  const totalReceita = payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0
  const totalConcluidos = completions?.filter(c => c.is_completed).length || 0
  const taxaConclusao = completions && completions.length > 0
    ? Math.round((totalConcluidos / completions.length) * 100)
    : 0

  const stats = [
    { label: 'Empresas', value: totalTenants || 0, delta: 'registadas', icon: '🏢' },
    { label: 'Cursos', value: totalCourses || 0, delta: 'criados', icon: '📚' },
    { label: 'Inscricoes Ativas', value: totalEnrollments || 0, delta: 'formandos', icon: '👥' },
    { label: 'Receita Total', value: `${totalReceita.toFixed(0)}€`, delta: 'acumulada', icon: '💶' },
    { label: 'Licoes Concluidas', value: totalConcluidos, delta: `${taxaConclusao}% taxa`, icon: '✅' },
  ]

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Estatisticas</div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8edf3' }}>
              <div style={{ float: 'right', fontSize: 20, opacity: 0.15 }}>{s.icon}</div>
              <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: '6px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#4a90d9', fontWeight: 600 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
            Progresso por Curso
          </div>
          {cursos && cursos.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Curso', 'Licoes', 'Inscritos'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 20px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cursos.map((c: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{c.title}</td>
                    <td style={{ fontSize: 12 }}>{c.lessons?.[0]?.count || 0}</td>
                    <td style={{ fontSize: 12 }}>{c.enrollments?.[0]?.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              Nenhum dado disponivel ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
