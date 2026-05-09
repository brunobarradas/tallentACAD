import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

export default async function CoursePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!course) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, order_index, unlock_after_days')
    .eq('course_id', course.id)
    .eq('status', 'published')
    .order('order_index', { ascending: true })

  const typeLabel: Record<string, string> = { free: 'Gratuito', paid: 'Pago', sold: 'Disponivel' }
  const typeColor: Record<string, string> = { free: '#dcfce7', paid: '#dbeafe', sold: '#fef3c7' }
  const typeText: Record<string, string> = { free: '#16a34a', paid: '#1d4ed8', sold: '#d97706' }

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <header style={{ background: '#1e3a5f', padding: '0 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </Link>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>Entrar</Link>
            <Link href="/registo" style={{ background: '#f5a623', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Registar</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 40px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#4a90d9', textDecoration: 'none' }}>Catalogo</Link>
          {' / '}{course.title}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>

          {/* Coluna principal */}
          <div>
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', borderRadius: 14, marginBottom: 28, maxHeight: 300, objectFit: 'cover' }} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: typeColor[course.type], color: typeText[course.type] }}>
                {typeLabel[course.type]}
              </span>
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>{course.title}</h1>

            {course.description && (
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 28 }}>{course.description}</p>
            )}

            {/* Licoes */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8edf3', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8edf3', fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>
                Conteudo do curso ({lessons?.length || 0} licoes)
              </div>
              {lessons && lessons.map((lesson: any, i: number) => (
                <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1e3a5f', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{lesson.title}</div>
                    {lesson.unlock_after_days > 0 && (
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Disponivel no dia {lesson.unlock_after_days}</div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>🔒</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna lateral — CTA */}
          <div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8edf3', padding: 24, position: 'sticky', top: 24 }}>
              {course.type === 'paid' && (
                <div style={{ fontSize: 36, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>{course.price}€</div>
              )}
              {course.type === 'free' && (
                <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>Gratuito</div>
              )}

              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
                <div style={{ marginBottom: 6 }}>📅 Inicio: {new Date(course.starts_at).toLocaleDateString('pt-PT')}</div>
                <div style={{ marginBottom: 6 }}>⏱ Acesso: {course.access_days} dias</div>
                <div>📚 {lessons?.length || 0} licoes</div>
              </div>

              <Link
                href={`/registo?curso=${course.slug}`}
                style={{ display: 'block', width: '100%', padding: '14px', background: '#f5a623', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 15, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}
              >
                {course.type === 'paid' ? `Comprar — ${course.price}€` : 'Inscrever-me'}
              </Link>

              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#9ca3af' }}>
                Ja tem conta?{' '}
                <Link href={`/login?redirect=/curso/${course.slug}`} style={{ color: '#4a90d9' }}>Entrar</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
