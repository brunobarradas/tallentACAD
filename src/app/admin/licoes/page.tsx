export default function LicoesPage() {
  const licoes = [
    { num: 1, titulo: 'Introducao ao Excel', dia: 0, conteudos: 'Video + PDF', estado: 'Publicado' },
    { num: 2, titulo: 'Formulas Avancadas', dia: 3, conteudos: 'Video + Quiz', estado: 'Publicado' },
    { num: 3, titulo: 'Tabelas Dinamicas', dia: 7, conteudos: 'Video + PDF + Quiz', estado: 'Rascunho' },
  ]

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Gestao de Licoes</div>
        <a href="/admin/licoes/nova" style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          + Nova Licao
        </a>
      </div>
      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Lista de licoes */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
            Licoes — Excel Avancado
          </div>
          <div style={{ padding: '0 20px' }}>
            {licoes.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < licoes.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1e3a5f', flexShrink: 0 }}>
                  {l.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{l.titulo}</div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>Disponivel no dia {l.dia} · {l.conteudos}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: l.estado === 'Publicado' ? '#dcfce7' : '#f3f4f6', color: l.estado === 'Publicado' ? '#16a34a' : '#6b7280' }}>
                  {l.estado}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario nova licao */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
            Nova Licao
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Titulo da Licao</label>
              <input style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif' }} placeholder="Ex: Introducao ao Excel" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Disponivel apos (dias)</label>
                <input type="number" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif' }} placeholder="0" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Ordem</label>
                <input type="number" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif' }} placeholder="1" />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Conteudos</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['+ Video', '+ Audio', '+ PDF', '+ Quiz'].map(c => (
                  <span key={c} style={{ padding: '6px 12px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{c}</span>
                ))}
              </div>
            </div>
            <button style={{ width: '100%', padding: 10, background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
              Guardar Licao
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
