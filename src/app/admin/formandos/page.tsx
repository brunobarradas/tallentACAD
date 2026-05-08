import { createServerSupabaseClient } from '@/lib/supabase'

export default async function FormandosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id, enrolled_at, expires_at, status,
      tenant_users (name, email),
      courses (title)
    `)
    .order('enrolled_at', { ascending: false })

  const { data: completions } = await supabase
    .from('lesson_access')
    .select('enrollment_id, is_completed')

  const progressByEnrollment = (completions || []).reduce((acc: Record<string, { total: number, done: number }>, la: any) => {
    if (!acc[la.enrollment_id]) acc[la.enrollment_id] = { total: 0, done: 0 }
    acc[la.enrollment_id].total++
    if (la.is_completed) acc[la.enrollment_id].done++
    return acc
  }, {})

  const badgeColor: Record<string, string> = {
    active: '#dcfce7', expired: '#fef3c7', cancelled: '#fee2e2',
  }
  const badgeText: Record<string, string> = {
    active: '#16a34a', expired: '#d97706', cancelled: '#dc2626',
  }
  const badgeLabel: Record<string, string> = {
    active: 'Ativo', expired: 'Expirado', cancelled: 'Cancelado',
  }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Gestao de Formandos</div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          {enrollments && enrollments.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Formando', 'Email', 'Curso', 'Progresso', 'Inscrito', 'Expira', 'Estado'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 20px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e: any, i: number) => {
                  const prog = progressByEnrollment[e.id]
                  const pct = prog && prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{e.tenant_users?.name || '-'}</td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{e.tenant_users?.email || '-'}</td>
                      <td style={{ fontSize: 12 }}>{e.courses?.title || '-'}</td>
                      <td style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? '#16a34a' : '#374151' }}>{pct}%</td>
                      <td style={{ fontSize: 12 }}>{new Date(e.enrolled_at).toLocaleDateString('pt-PT')}</td>
                      <td style={{ fontSize: 12 }}>{new Date(e.expires_at).toLocaleDateString('pt-PT')}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[e.status] || '#f3f4f6', color: badgeText[e.status] || '#6b7280' }}>
                          {badgeLabel[e.status] || e.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              Nenhum formando inscrito ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
