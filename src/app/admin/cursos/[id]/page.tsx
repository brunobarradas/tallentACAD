'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditarCursoPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [form, setForm] = useState({
    title: '', slug: '', description: '', type: 'free',
    price: '', starts_at: '', ends_at: '', access_days: '90',
    language: 'pt', status: 'draft',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch(`/api/cursos/${courseId}`)
      .then(r => r.json())
      .then(d => {
        if (d.course) {
          const c = d.course
          setForm({
            title: c.title || '',
            slug: c.slug || '',
            description: c.description || '',
            type: c.type || 'free',
            price: c.price ? String(c.price) : '',
            starts_at: c.starts_at ? c.starts_at.split('T')[0] : '',
            ends_at: c.ends_at ? c.ends_at.split('T')[0] : '',
            access_days: c.access_days ? String(c.access_days) : '90',
            language: c.language || 'pt',
            status: c.status || 'draft',
          })
        }
        setLoading(false)
      })
  }, [courseId])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const res = await fetch(`/api/cursos/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price) || 0,
        access_days: parseInt(form.access_days),
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erro ao guardar.')
      setSaving(false)
      return
    }

    setSuccess('Curso guardado com sucesso!')
    setSaving(false)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, color: '#1e3a5f', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6 }

  if (loading) return (
    <div style={{ padding: 40, color: '#6b7280', fontFamily: 'Georgia, serif' }}>A carregar...</div>
  )

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Editar Curso</div>
        <Link href="/admin/cursos" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>← Voltar</Link>
      </div>

      <div style={{ padding: '32px 28px', maxWidth: 700 }}>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 20 }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 20 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Informacao Geral */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Informacao Geral</div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Titulo do Curso *</label>
              <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Slug (URL)</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '10px 12px', background: '#f0f4f8', border: '1px solid #e8edf3', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                  tallentacad.com/curso/
                </span>
                <input name="slug" value={form.slug} onChange={handleChange} style={{ ...inputStyle, borderRadius: '0 8px 8px 0' }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Descricao</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
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

          {/* Tipo e Preco */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Tipo e Preco</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Tipo de Curso</label>
                <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                  <option value="free">Gratuito</option>
                  <option value="paid">Pago</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
              {form.type === 'paid' && (
                <div>
                  <label style={labelStyle}>Preco (€)</label>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} style={inputStyle} />
                </div>
              )}
            </div>
          </div>

          {/* Estado */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Estado</div>
            <div>
              <label style={labelStyle}>Estado do Curso</label>
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          {/* Datas */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 28, marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Datas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Data de Inicio</label>
                <input name="starts_at" type="date" value={form.starts_at} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Data de Fim</label>
                <input name="ends_at" type="date" value={form.ends_at} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '12px 32px', background: saving ? '#9ab3cc' : '#f5a623', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}
            >
              {saving ? 'A guardar...' : 'Guardar Alteracoes'}
            </button>
            <Link
              href={`/admin/licoes?course_id=${courseId}`}
              style={{ padding: '12px 24px', background: '#4a90d9', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              Gerir Licoes
            </Link>
            <Link
              href="/admin/cursos"
              style={{ padding: '12px 24px', background: '#f0f4f8', color: '#1e3a5f', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
