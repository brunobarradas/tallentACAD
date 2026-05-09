'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Lesson {
  id: string
  title: string
  order_index: number
  unlock_after_days: number
}

interface Props {
  lessons: Lesson[]
  enrollmentId: string
  daysSinceEnroll: number
  accessMap: Record<string, any>
}

export default function LicaoViewer({ lessons, enrollmentId, daysSinceEnroll, accessMap }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const licaoId = searchParams.get('licao')

  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)

  // Selecionar primeira licao desbloqueada por defeito
  const firstUnlocked = lessons.find(l => daysSinceEnroll >= l.unlock_after_days)
  const activeLessonId = licaoId || firstUnlocked?.id
  const activeLesson = lessons.find(l => l.id === activeLessonId)
  const isCompleted = activeLessonId ? accessMap[activeLessonId]?.is_completed : false

  useEffect(() => {
    if (!activeLessonId) return
    setLoading(true)
    fetch(`/api/conteudos?lesson_id=${activeLessonId}`)
      .then(r => r.json())
      .then(d => {
        setContents(d.contents || [])
        setLoading(false)
        // Registar acesso
        fetch('/api/lesson-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollment_id: enrollmentId, lesson_id: activeLessonId }),
        })
      })
  }, [activeLessonId])

  async function markComplete() {
    if (!activeLessonId || marking) return
    setMarking(true)
    await fetch('/api/lesson-access', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollment_id: enrollmentId, lesson_id: activeLessonId }),
    })
    router.refresh()
    setMarking(false)
  }

  if (!activeLesson) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 60, textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
        <p>Seleciona uma licao para comecar.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', overflow: 'hidden' }}>
      {/* Header da licao */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Licao {(activeLesson.order_index || 0) + 1}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f' }}>{activeLesson.title}</h2>
        </div>
        {isCompleted ? (
          <div style={{ padding: '8px 16px', background: '#dcfce7', color: '#16a34a', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
            ✓ Concluida
          </div>
        ) : (
          <button
            onClick={markComplete}
            disabled={marking}
            style={{ padding: '8px 16px', background: marking ? '#9ab3cc' : '#f5a623', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: marking ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}
          >
            {marking ? 'A guardar...' : 'Marcar como concluida'}
          </button>
        )}
      </div>

      {/* Conteudos */}
      <div style={{ padding: 28 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>A carregar conteudos...</div>
        ) : contents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {contents.map((content: any) => (
              <div key={content.id}>
                {content.type === 'video' && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🎬 Video</div>
                    {content.url.includes('youtube.com') || content.url.includes('youtu.be') ? (
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 10, overflow: 'hidden' }}>
                        <iframe
                          src={content.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video controls style={{ width: '100%', borderRadius: 10, maxHeight: 480 }} src={content.url} />
                    )}
                  </div>
                )}

                {content.type === 'audio' && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🎵 Audio</div>
                    <audio controls style={{ width: '100%' }} src={content.url} />
                  </div>
                )}

                {content.type === 'pdf' && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📄 Documento PDF</div>
                    <div style={{ border: '1px solid #e8edf3', borderRadius: 10, overflow: 'hidden' }}>
                      <iframe src={content.url} style={{ width: '100%', height: 600, border: 'none' }} />
                    </div>
                    <a href={content.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#4a90d9' }}>
                      Abrir PDF em nova janela
                    </a>
                  </div>
                )}

                {content.type === 'text' && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📝 Conteudo</div>
                    <div style={{ background: '#f8f9fb', borderRadius: 10, padding: 20, fontSize: 14, lineHeight: 1.7, color: '#374151' }}>
                      {content.url}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 13 }}>Esta licao ainda nao tem conteudos.</p>
          </div>
        )}
      </div>

      {/* Navegacao entre licoes */}
      <div style={{ padding: '16px 28px', borderTop: '1px solid #e8edf3', display: 'flex', justifyContent: 'space-between' }}>
        {(() => {
          const idx = lessons.findIndex(l => l.id === activeLessonId)
          const prev = idx > 0 ? lessons[idx - 1] : null
          const next = idx < lessons.length - 1 ? lessons[idx + 1] : null
          const nextUnlocked = next && daysSinceEnroll >= next.unlock_after_days
          return (
            <>
              {prev ? (
                <a href={`?licao=${prev.id}`} style={{ fontSize: 13, color: '#4a90d9', textDecoration: 'none' }}>← {prev.title}</a>
              ) : <span />}
              {next ? (
                nextUnlocked ? (
                  <a href={`?licao=${next.id}`} style={{ fontSize: 13, color: '#4a90d9', textDecoration: 'none' }}>{next.title} →</a>
                ) : (
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>Proxima licao disponivel no dia {next.unlock_after_days} 🔒</span>
                )
              ) : (
                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Ultima licao do curso!</span>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}
