'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NovoCursoPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', slug: '', description: '', type: 'free',
    price: '', starts_at: '', ends_at: '', access_days: '90', language: 'pt',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? { slug: value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {})
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0, access_days: parseInt(form.access_days) }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erro ao criar curso.'); setLoading(false); return }
    router.push('/admin/cursos')
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, color: '#1e3a5f', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6 }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Novo Curso</div>
        <Link href="/admin/cursos" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>← Voltar</Link>
      </div>

      <div style={{ padding: '32px 28px', maxWidth: 700 }}>
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 20 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Informacao Geral</div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Titulo do Curso *</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: Excel Avancado" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Slug (URL) *</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '10px 12px', background: '#f0f4f8', border: '1px solid #e8edf3', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                  tallentacad.com/curso/
                </span>
                <input name="slug" value={form.slug} onChange={handleChange} required style={{ ...inputStyle, borderRadius: '0 8px 8px 0' }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Descricao</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Descricao do curso..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Idioma</label>
                <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
                  <option value="pt">Portugues</option>
                  <option value="en">Ingles</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Acesso (dias)</label>
                <input name="access_days" type="number" value={form.access_days} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Tipo e Preco</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Tipo de Curso *</label>
                <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                  <option value="free">Gratuito</option>
                  <option value="paid">Pago</option>
                  <option value="sold">Vendido (acesso direto)</option>
                </select>
              </div>
              {form.type === 'paid' && (
                <div>
                  <label style={labelStyle}>Preco (€) *</label>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" style={inputStyle} />
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 28, marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Datas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Data de Inicio *</label>
                <input name="starts_at" type="date" value={form.starts_at} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Data de Fim *</label>
                <input name="ends_at" type="date" value={form.ends_at} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px 32px', background: loading ? '#9ab3cc' : '#f5a623', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}
          >
            {loading ? 'A criar...' : 'Criar Curso'}
          </button>
        </form>
      </div>
    </div>
  )
}
