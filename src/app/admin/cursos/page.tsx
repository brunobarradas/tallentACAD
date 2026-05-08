export default function CursosPage() {
  const cursos = [
    { nome: 'Excel Avancado', inicio: '01/05/2026', fim: '31/07/2026', acesso: 90, licoes: 8, inscritos: 45, estado: 'Publicado' },
    { nome: 'Power BI Basico', inicio: '15/05/2026', fim: '15/08/2026', acesso: 60, licoes: 6, inscritos: 28, estado: 'Publicado' },
    { nome: 'Lideranca', inicio: '01/06/2026', fim: '30/09/2026', acesso: 120, licoes: 3, inscritos: 0, estado: 'Rascunho' },
  ]

  const badgeColor: Record<string, string> = { Publicado: '#dcfce7', Rascunho: '#f3f4f6', Revisao: '#fef3c7' }
  const badgeText: Record<string, string> = { Publicado: '#16a34a', Rascunho: '#6b7280', Revisao: '#d97706' }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Gestao de Cursos</div>
        <a href="/admin/cursos/novo" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Novo Curso
        </a>
      </div>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Curso', 'Inicio', 'Fim', 'Acesso', 'Licoes', 'Inscritos', 'Estado', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 20px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cursos.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{c.nome}</td>
                  <td style={{ fontSize: 12 }}>{c.inicio}</td>
                  <td style={{ fontSize: 12 }}>{c.fim}</td>
                  <td style={{ fontSize: 12 }}>{c.acesso} dias</td>
                  <td style={{ fontSize: 12 }}>{c.licoes}</td>
                  <td style={{ fontSize: 12 }}>{c.inscritos}</td>
                  <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[c.estado], color: badgeText[c.estado] }}>{c.estado}</span></td>
                  <td><a href="/admin/licoes" style={{ padding: '5px 12px', background: '#1e3a5f', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>Licoes</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
