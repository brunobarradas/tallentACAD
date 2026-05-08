export default function EstatisticasPage() {
  const stats = [
    { label: 'Cursos Ativos', value: '3', delta: '↑ 1 este mes', icon: '📚' },
    { label: 'Formandos', value: '73', delta: '↑ 12 este mes', icon: '👥' },
    { label: 'Conclusoes', value: '28', delta: '38% taxa de conclusao', icon: '✅' },
    { label: 'Quiz Aprovados', value: '156', delta: '82% taxa de aprovacao', icon: '⭐' },
  ]

  const cursos = [
    { nome: 'Excel Avancado', inscritos: 45, progresso: 32, concluidos: 13, taxa: '29%' },
    { nome: 'Power BI Basico', inscritos: 28, progresso: 20, concluidos: 8, taxa: '29%' },
    { nome: 'Lideranca', inscritos: 0, progresso: 0, concluidos: 0, taxa: '-' },
  ]

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Estatisticas</div>
      </div>
      <div style={{ padding: '24px 28px' }}>
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

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
            Progresso por Curso
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Curso', 'Inscritos', 'Em Progresso', 'Concluidos', 'Taxa'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', padding: '12px 20px', borderBottom: '1px solid #e8edf3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cursos.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{c.nome}</td>
                  <td style={{ fontSize: 12 }}>{c.inscritos}</td>
                  <td style={{ fontSize: 12 }}>{c.progresso}</td>
                  <td style={{ fontSize: 12 }}>{c.concluidos}</td>
                  <td style={{ fontSize: 12, fontWeight: 600, color: c.taxa !== '-' ? '#16a34a' : '#6b7280' }}>{c.taxa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
