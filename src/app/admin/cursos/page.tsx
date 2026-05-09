import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminCursosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug, type, price, status, starts_at, ends_at, access_days, created_at')
    .order('created_at', { ascending: false })

  const { data: enrollmentCounts } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('status', 'active')

  const countMap = (enrollmentCounts || []).reduce((acc: Record<string, number>, e: any) => {
    acc[e.course_id] = (acc[e.course_id] || 0) + 1
    return acc
  }, {})

  const badgeColor: Record<string, string> = { published: '#dcfce7', draft: '#f3f4f6', archived: '#fef3c7', free: '#dcfce7', paid: '#dbeafe', sold: '#fef3c7' }
  const badgeText: Record<string, string> = { published: '#16a34a', draft: '#6b7280', archived: '#d97706', free: '#16a34a', paid: '#1d4ed8', sold: '#d97706' }
  const badgeLabel: Record<string, string> = { published: 'Publicado', draft: 'Rascunho', archived: 'Arquivado', free: 'Gratuito', paid: 'Pago', sold: 'Vendido' }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Gestao de Cursos</div>
        <Link href="/admin/cursos/novo" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Novo Curso
        </Link>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          {courses && courses.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Curso', 'Tipo', 'Preco', 'Inicio', 'Fim', 'Acesso', 'Inscritos', 'Estado', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 16px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{c.title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[c.type] || '#f3f4f6', color: badgeText[c.type] || '#6b7280' }}>
                        {badgeLabel[c.type] || c.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}>{c.type === 'paid' ? `${c.price}€` : '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}>{new Date(c.starts_at).toLocaleDateString('pt-PT')}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}>{new Date(c.ends_at).toLocaleDateString('pt-PT')}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}>{c.access_days} dias</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>{countMap[c.id] || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[c.status] || '#f3f4f6', color: badgeText[c.status] || '#6b7280' }}>
                        {badgeLabel[c.status] || c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/admin/cursos/${c.id}`} style={{ padding: '4px 10px', background: '#1e3a5f', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                          Editar
                        </Link>
                        <Link href={`/admin/licoes?course_id=${c.id}`} style={{ padding: '4px 10px', background: '#4a90d9', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                          Licoes
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 60, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              Nenhum curso criado ainda.{' '}
              <Link href="/admin/cursos/novo" style={{ color: '#4a90d9' }}>Criar o primeiro curso</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
