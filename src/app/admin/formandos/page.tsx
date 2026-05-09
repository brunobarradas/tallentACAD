import { createServerSupabaseClient } from '@/lib/supabase'

export default async function AdminFormandosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id, enrolled_at, expires_at, status, stripe_payment_id,
      users (id, name, email),
      courses (id, title, type, price)
    `)
    .order('enrolled_at', { ascending: false })

  const badgeColor: Record<string, string> = { active: '#dcfce7', expired: '#fef3c7', cancelled: '#fee2e2', pending_payment: '#f3f4f6' }
  const badgeText: Record<string, string> = { active: '#16a34a', expired: '#d97706', cancelled: '#dc2626', pending_payment: '#6b7280' }
  const badgeLabel: Record<string, string> = { active: 'Ativo', expired: 'Expirado', cancelled: 'Cancelado', pending_payment: 'Pendente' }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Formandos e Inscricoes</div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          {enrollments && enrollments.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Formando', 'Email', 'Curso', 'Tipo', 'Valor', 'Inscrito', 'Expira', 'Estado'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 16px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e: any) => {
                  const user = e.users
                  const course = e.courses
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{user?.name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: '#6b7280' }}>{user?.email || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12 }}>{course?.title || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: '#6b7280' }}>{course?.type === 'paid' ? 'Pago' : 'Gratuito'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>{course?.type === 'paid' ? `${course.price}€` : '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: '#6b7280' }}>{new Date(e.enrolled_at).toLocaleDateString('pt-PT')}</td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: '#6b7280' }}>{new Date(e.expires_at).toLocaleDateString('pt-PT')}</td>
                      <td style={{ padding: '12px 16px' }}>
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
            <div style={{ padding: 60, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              Nenhum formando inscrito ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
