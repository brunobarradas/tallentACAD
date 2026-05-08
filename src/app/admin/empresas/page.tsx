import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function EmpresasPage() {
  const supabase = await createServerSupabaseClient()

  const { data: empresas } = await supabase
    .from('tenants')
    .select(`
      id, name, slug, email, status, trial_ends_at, created_at,
      plan_limits (max_courses, max_enrollments, current_courses, current_enrollments)
    `)
    .neq('is_owner', true)
    .order('created_at', { ascending: false })

  const badgeColor: Record<string, string> = {
    active: '#dcfce7', trial: '#dbeafe', blocked: '#fee2e2', suspended: '#f3f4f6',
  }
  const badgeText: Record<string, string> = {
    active: '#16a34a', trial: '#1d4ed8', blocked: '#dc2626', suspended: '#6b7280',
  }
  const badgeLabel: Record<string, string> = {
    active: 'Ativo', trial: 'Trial', blocked: 'Bloqueado', suspended: 'Suspenso',
  }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Gestao de Empresas</div>
        <Link href="/admin/empresas/nova" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Nova Empresa
        </Link>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          {empresas && empresas.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Empresa', 'Slug', 'Email', 'Cursos', 'Inscricoes', 'Trial ate', 'Estado', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 20px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empresas.map((e: any, i: number) => {
                  const limits = Array.isArray(e.plan_limits) ? e.plan_limits[0] : e.plan_limits
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{e.name}</td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{e.slug}</td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{e.email}</td>
                      <td style={{ fontSize: 12 }}>
                        {limits ? `${limits.current_courses}/${limits.max_courses}` : '-'}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {limits ? `${limits.current_enrollments}/${limits.max_enrollments}` : '-'}
                      </td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>
                        {e.trial_ends_at ? new Date(e.trial_ends_at).toLocaleDateString('pt-PT') : '-'}
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[e.status] || '#f3f4f6', color: badgeText[e.status] || '#6b7280' }}>
                          {badgeLabel[e.status] || e.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/empresas/${e.id}`} style={{ padding: '5px 12px', background: '#1e3a5f', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                          Gerir
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              Nenhuma empresa registada ainda.{' '}
              <Link href="/admin/empresas/nova" style={{ color: '#4a90d9' }}>Criar a primeira empresa</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
