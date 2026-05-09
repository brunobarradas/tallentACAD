'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'

function EditarLicaoForm() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const lessonId = params.id as string
  const courseId = searchParams.get('course_id') || ''

  const [form, setForm] = useState({ title: '', unlock_after_days: '0', order_index: '0', status: 'draft' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/licoes/${lessonId}`)
      .then(r => r.json())
      .then(d => {
        if (d.lesson) {
          setForm({
            title: d.lesson.title,
            unlock_after_days: String(d.lesson.unlock_after_days),
            order_index: String(d.lesson.order_index),
            status: d.lesson.status,
          })
        }
        setLoading(false)
      })
  }, [lessonId])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch(`/api/licoes/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        unlock_after_days: parseInt(form.unlock_after_days),
        order_index: parseInt(form.order_index),
        status: form.status,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erro ao guardar.'); setSaving(false); return }
    router.push(`/admin/licoes?course_id=${courseId}`)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, color: '#1e3a5f', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6 }

  if (loading) return <div style={{ padding: 40, color: '#6b7280' }}>A carregar...</div>

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Editar Licao</div>
        <Link href={`/admin/licoes?course_id=${courseId}`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>← Voltar</Link>
      </div>

      <div style={{ padding: '32px 28px', maxWidth: 600 }}>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 28, marginBottom: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Titulo da Licao *</label>
              <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Ordem</label>
                <input name="order_index" type="number" min="0" value={form.order_index} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Disponivel apos (dias)</label>
                <input name="unlock_after_days" type="number" min="0" value={form.unlock_after_days} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicada</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} style={{ padding: '12px 32px', background: saving ? '#9ab3cc' : '#f5a623', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}>
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
            <Link href={`/admin/licoes/${lessonId}/conteudos?course_id=${courseId}`} style={{ padding: '12px 24px', background: '#4a90d9', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Gerir Conteudos
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EditarLicaoPage() {
  return <Suspense><EditarLicaoForm /></Suspense>
}
