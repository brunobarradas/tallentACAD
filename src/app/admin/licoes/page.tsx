import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

type Props = { searchParams: Promise<{ course_id?: string }> }

export default async function LicoesPage({ searchParams }: Props) {
  const { course_id } = await searchParams
  const supabase = await createServerSupabaseClient()

  // Buscar todos os cursos para o selector
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title', { ascending: true })

  // Buscar licoes do curso selecionado
  const { data: lessons } = course_id ? await supabase
    .from('lessons')
    .select('id, title, order_index, unlock_after_days, status')
    .eq('course_id', course_id)
    .order('order_index', { ascending: true }) : { data: [] }

  const selectedCourse = courses?.find((c: any) => c.id === course_id)

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>Gestao de Licoes</div>
        {course_id && (
          <Link href={`/admin/licoes/nova?course_id=${course_id}`} style={{ padding: '8px 16px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            + Nova Licao
          </Link>
        )}
      </div>

      <div style={{ padding: '24px 28px' }}>

        {/* Selector de curso */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 20, marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Selecionar Curso
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {courses?.map((c: any) => (
              <Link
                key={c.id}
                href={`/admin/licoes?course_id=${c.id}`}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  background: course_id === c.id ? '#1e3a5f' : '#f0f4f8',
                  color: course_id === c.id ? '#fff' : '#1e3a5f',
                  border: `1px solid ${course_id === c.id ? '#1e3a5f' : '#e8edf3'}`,
                }}
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Lista de licoes */}
        {course_id ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
                Licoes — {selectedCourse?.title}
              </div>
              {lessons && lessons.length > 0 ? (
                <div>
                  {lessons.map((l: any, i: number) => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f9fafb' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1e3a5f', flexShrink: 0 }}>
                        {l.order_index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{l.title}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                          {l.unlock_after_days === 0 ? 'Disponivel imediatamente' : `Disponivel no dia ${l.unlock_after_days}`}
                        </div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: l.status === 'published' ? '#dcfce7' : '#f3f4f6', color: l.status === 'published' ? '#16a34a' : '#6b7280' }}>
                        {l.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/admin/licoes/${l.id}?course_id=${course_id}`} style={{ padding: '4px 10px', background: '#1e3a5f', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                          Editar
                        </Link>
                        <Link href={`/admin/licoes/${l.id}/conteudos?course_id=${course_id}`} style={{ padding: '4px 10px', background: '#4a90d9', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                          Conteudos
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                  Nenhuma licao criada.{' '}
                  <Link href={`/admin/licoes/nova?course_id=${course_id}`} style={{ color: '#4a90d9' }}>Criar a primeira</Link>
                </div>
              )}
            </div>

            {/* Formulario rapido nova licao */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 24, alignSelf: 'start' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}>Nova Licao Rapida</div>
              <form action={`/api/licoes`} method="POST">
                <input type="hidden" name="course_id" value={course_id} />
                <input type="hidden" name="order_index" value={lessons?.length || 0} />
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Titulo</label>
                  <input name="title" required placeholder="Ex: Introducao ao MS Project" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', boxSizing: 'border-box' as const }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Disponivel apos (dias)</label>
                  <input name="unlock_after_days" type="number" defaultValue="0" min="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', boxSizing: 'border-box' as const }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Estado</label>
                  <select name="status" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', boxSizing: 'border-box' as const }}>
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicada</option>
                  </select>
                </div>
                <Link
                  href={`/admin/licoes/nova?course_id=${course_id}`}
                  style={{ display: 'block', width: '100%', padding: '10px', background: '#f5a623', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' as const }}
                >
                  Criar Licao Completa
                </Link>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 60, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
            Seleciona um curso acima para ver e gerir as suas licoes.
          </div>
        )}
      </div>
    </div>
  )
}
