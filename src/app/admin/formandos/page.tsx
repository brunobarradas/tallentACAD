export default function FormandosPage() {
  const formandos = [
    { nome: 'Ana Silva', email: 'ana@empresa.pt', curso: 'Excel Avancado', progresso: '65%', inscrito: '01/05/2026', expira: '30/07/2026', estado: 'Ativo' },
    { nome: 'Joao Costa', email: 'joao@empresa.pt', curso: 'Power BI', progresso: '30%', inscrito: '15/05/2026', expira: '14/07/2026', estado: 'Ativo' },
    { nome: 'Maria Santos', email: 'maria@empresa.pt', curso: 'Excel Avancado', progresso: '100%', inscrito: '01/05/2026', expira: '30/07/2026', estado: 'Concluido' },
    { nome: 'Pedro Lopes', email: 'pedro@empresa.pt', curso: 'Lideranca', progresso: '0%', inscrito: '01/06/2026', expira: '29/09/2026', estado: 'Nao iniciado' },
  ]

  const badgeColor: Record<string, string> = { Ativo: '#dcfce7', Concluido: '#dbeafe', 'Nao iniciado': '#fef3c7' }
  const badgeText: Record<string, string> = { Ativo: '#16a34a', Concluido: '#1d4ed8', 'Nao iniciado': '#d97706' }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Gestao de Formandos</div>
        <a href="#" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Convidar Formando
        </a>
      </div>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nome', 'Email', 'Curso', 'Progresso', 'Inscrito', 'Expira', 'Estado'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 20px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formandos.map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{f.nome}</td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>{f.email}</td>
                  <td style={{ fontSize: 12 }}>{f.curso}</td>
                  <td style={{ fontSize: 12, fontWeight: 600, color: f.progresso === '100%' ? '#16a34a' : '#374151' }}>{f.progresso}</td>
                  <td style={{ fontSize: 12 }}>{f.inscrito}</td>
                  <td style={{ fontSize: 12 }}>{f.expira}</td>
                  <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: badgeColor[f.estado], color: badgeText[f.estado] }}>{f.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
