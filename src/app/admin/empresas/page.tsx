export default function EmpresasPage() {
  const empresas = [
    { nome: 'TechCorp Lda', slug: 'techcorp', plano: 'Pro', cursos: 8, formandos: 120, estado: 'Ativo' },
    { nome: 'Formacao XYZ', slug: 'formacaoxyz', plano: 'Starter', cursos: 2, formandos: 34, estado: 'Ativo' },
    { nome: 'Consultora ABC', slug: 'consultorabc', plano: 'Enterprise', cursos: 15, formandos: 280, estado: 'Trial' },
    { nome: 'Academia 360', slug: 'academia360', plano: 'Pro', cursos: 4, formandos: 90, estado: 'Pendente' },
  ]

  const badgeColor: Record<string, string> = { Ativo: '#dcfce7', Trial: '#dbeafe', Pendente: '#fef3c7' }
  const badgeText: Record<string, string> = { Ativo: '#16a34a', Trial: '#1d4ed8', Pendente: '#d97706' }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Gestao de Empresas</div>
        <a href="/admin/empresas/nova" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Nova Empresa
        </a>
      </div>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Empresa', 'Slug', 'Plano', 'Cursos', 'Formandos', 'Estado', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 20px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empresas.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{e.nome}</td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>{e.slug}</td>
                  <td style={{ fontSize: 12 }}>{e.plano}</td>
                  <td style={{ fontSize: 12 }}>{e.cursos}</td>
                  <td style={{ fontSize: 12 }}>{e.formandos}</td>
                  <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[e.estado], color: badgeText[e.estado] }}>{e.estado}</span></td>
                  <td><a href="#" style={{ padding: '5px 12px', background: '#1e3a5f', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>Gerir</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
