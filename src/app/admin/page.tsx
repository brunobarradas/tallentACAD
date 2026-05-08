export default function AdminDashboard() {
  const stats = [
    { label: 'Empresas', value: '12', delta: '↑ 3 este mes', icon: '🏢' },
    { label: 'Cursos Ativos', value: '38', delta: '↑ 7 este mes', icon: '📚' },
    { label: 'Formandos', value: '524', delta: '↑ 41 este mes', icon: '👥' },
    { label: 'Receita Mensal', value: '2.4k€', delta: '↑ 18% vs mes anterior', icon: '💶' },
  ]

  const empresas = [
    { nome: 'TechCorp Lda', plano: 'Pro', estado: 'Ativo' },
    { nome: 'Formacao XYZ', plano: 'Starter', estado: 'Ativo' },
    { nome: 'Consultora ABC', plano: 'Enterprise', estado: 'Trial' },
    { nome: 'Academia 360', plano: 'Pro', estado: 'Pendente' },
  ]

  const cursos = [
    { nome: 'Excel Avancado', empresa: 'TechCorp', estado: 'Publicado' },
    { nome: 'Lideranca', empresa: 'Formacao XYZ', estado: 'Rascunho' },
    { nome: 'Power BI', empresa: 'TechCorp', estado: 'Publicado' },
    { nome: 'Seguranca IT', empresa: 'Academia 360', estado: 'Revisao' },
  ]

  const badgeColor: Record<string, string> = {
    Ativo: '#dcfce7', Trial: '#dbeafe', Pendente: '#fef3c7', Rascunho: '#f3f4f6',
    Publicado: '#dcfce7', Revisao: '#fef3c7',
  }
  const badgeText: Record<string, string> = {
    Ativo: '#16a34a', Trial: '#1d4ed8', Pendente: '#d97706', Rascunho: '#6b7280',
    Publicado: '#16a34a', Revisao: '#d97706',
  }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Dashboard</div>
        <a href="/admin/empresas/nova" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Nova Empresa
        </a>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8edf3' }}>
              <div style={{ float: 'right', fontSize: 24, opacity: 0.15 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', margin: '6px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{s.delta}</div>
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
                    {['Empresa', 'Plano', 'Estado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '8px 0', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((e, i) => (
                    <tr key={i}>
                      <td style={{ padding: '10px 0', fontSize: 12 }}>{e.nome}</td>
                      <td style={{ fontSize: 12 }}>{e.plano}</td>
                      <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[e.estado], color: badgeText[e.estado] }}>{e.estado}</span></td>
                    </tr>
                  ))}
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
                    {['Curso', 'Empresa', 'Estado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '8px 0', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cursos.map((c, i) => (
                    <tr key={i}>
                      <td style={{ padding: '10px 0', fontSize: 12 }}>{c.nome}</td>
                      <td style={{ fontSize: 12 }}>{c.empresa}</td>
                      <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[c.estado], color: badgeText[c.estado] }}>{c.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
