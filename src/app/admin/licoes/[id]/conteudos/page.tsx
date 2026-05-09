'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConteudosForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const lessonId = params.id as string
  const courseId = searchParams.get('course_id') || ''

  const [lesson, setLesson] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState('video')
  const [externalUrl, setExternalUrl] = useState('')
  const [useUrl, setUseUrl] = useState(false)

  useEffect(() => {
    loadData()
  }, [lessonId])

  async function loadData() {
    setLoading(true)
    const [lRes, cRes] = await Promise.all([
      fetch(`/api/licoes/${lessonId}`),
      fetch(`/api/conteudos?lesson_id=${lessonId}`)
    ])
    const lData = await lRes.json()
    const cData = await cRes.json()
    setLesson(lData.lesson)
    setContents(cData.contents || [])
    setLoading(false)
  }

  async function handleAddContent(e: React.FormEvent) {
    e.preventDefault()
    setUploading(true)
    setError('')
    setSuccess('')

    let url = externalUrl

    // Upload de ficheiro se nao for URL externa
    if (!useUrl && fileRef.current?.files?.[0]) {
      const file = fileRef.current.files[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('lesson_id', lessonId)
      formData.append('type', selectedType)

      const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const upData = await upRes.json()
      if (!upRes.ok) { setError(upData.error || 'Erro ao fazer upload.'); setUploading(false); return }
      url = upData.url
    }

    if (!url) { setError('Introduza um URL ou selecione um ficheiro.'); setUploading(false); return }

    const res = await fetch('/api/conteudos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_id: lessonId,
        type: selectedType,
        url,
        filename: fileRef.current?.files?.[0]?.name || url.split('/').pop(),
        order_index: contents.length,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erro ao adicionar conteudo.'); setUploading(false); return }

    setSuccess('Conteudo adicionado com sucesso!')
    setExternalUrl('')
    if (fileRef.current) fileRef.current.value = ''
    await loadData()
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este conteudo?')) return
    await fetch(`/api/conteudos/${id}`, { method: 'DELETE' })
    await loadData()
  }

  const typeIcon: Record<string, string> = { video: '🎬', audio: '🎵', pdf: '📄', text: '📝' }
  const typeLabel: Record<string, string> = { video: 'Video', audio: 'Audio', pdf: 'PDF', text: 'Texto' }

  if (loading) return <div style={{ padding: 40, color: '#6b7280' }}>A carregar...</div>

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>
          Conteudos — {lesson?.title}
        </div>
        <Link href={`/admin/licoes?course_id=${courseId}`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>← Voltar</Link>
      </div>

      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20 }}>

        {/* Lista de conteudos */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
            Conteudos desta licao ({contents.length})
          </div>
          {contents.length > 0 ? (
            <div>
              {contents.map((c: any, i: number) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ fontSize: 24 }}>{typeIcon[c.type] || '📁'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{typeLabel[c.type]} {i + 1}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, wordBreak: 'break-all' }}>
                      {c.filename || c.url}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={c.url} target="_blank" rel="noreferrer" style={{ padding: '4px 10px', background: '#4a90d9', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                      Ver
                    </a>
                    <button onClick={() => handleDelete(c.id)} style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              Nenhum conteudo adicionado ainda.
            </div>
          )}
        </div>

        {/* Formulario adicionar conteudo */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 24, alignSelf: 'start' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Adicionar Conteudo</div>

          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 6, fontSize: 11, marginBottom: 14 }}>{error}</div>}
          {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 12px', borderRadius: 6, fontSize: 11, marginBottom: 14 }}>{success}</div>}

          <form onSubmit={handleAddContent}>
            {/* Tipo */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Tipo de conteudo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['video', 'audio', 'pdf', 'text'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    style={{
                      padding: '10px', border: `2px solid ${selectedType === t ? '#1e3a5f' : '#e8edf3'}`,
                      borderRadius: 8, background: selectedType === t ? '#1e3a5f' : '#fff',
                      color: selectedType === t ? '#fff' : '#374151', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Georgia, serif',
                    }}
                  >
                    {typeIcon[t]} {typeLabel[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Modo: upload ou URL */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button type="button" onClick={() => setUseUrl(false)} style={{ flex: 1, padding: '7px', border: `1px solid ${!useUrl ? '#1e3a5f' : '#e8edf3'}`, borderRadius: 6, background: !useUrl ? '#1e3a5f' : '#fff', color: !useUrl ? '#fff' : '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  Upload Ficheiro
                </button>
                <button type="button" onClick={() => setUseUrl(true)} style={{ flex: 1, padding: '7px', border: `1px solid ${useUrl ? '#1e3a5f' : '#e8edf3'}`, borderRadius: 6, background: useUrl ? '#1e3a5f' : '#fff', color: useUrl ? '#fff' : '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  URL Externo
                </button>
              </div>

              {!useUrl ? (
                <input
                  ref={fileRef}
                  type="file"
                  accept={selectedType === 'video' ? 'video/*' : selectedType === 'audio' ? 'audio/*' : selectedType === 'pdf' ? '.pdf' : '*'}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 12, boxSizing: 'border-box' as const }}
                />
              ) : (
                <input
                  type="url"
                  value={externalUrl}
                  onChange={e => setExternalUrl(e.target.value)}
                  placeholder={selectedType === 'video' ? 'https://youtube.com/...' : 'https://...'}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', boxSizing: 'border-box' as const }}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{ width: '100%', padding: '11px', background: uploading ? '#9ab3cc' : '#f5a623', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}
            >
              {uploading ? 'A processar...' : 'Adicionar Conteudo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ConteudosPage() {
  return <Suspense><ConteudosForm /></Suspense>
}
