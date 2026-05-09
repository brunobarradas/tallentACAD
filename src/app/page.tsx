import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug, description, thumbnail_url, type, price, starts_at, access_days')
    .eq('status', 'published')
    .gte('ends_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  const typeLabel: Record<string, string> = { free: 'Gratuito', paid: 'Pago', sold: 'Disponivel' }
  const typeColor: Record<string, string> = { free: '#dcfce7', paid: '#dbeafe', sold: '#fef3c7' }
  const typeText: Record<string, string> = { free: '#16a34a', paid: '#1d4ed8', sold: '#d97706' }

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <header style={{ background: '#1e3a5f', padding: '0 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>Entrar</Link>
            <Link href="/registo" style={{ background: '#f5a623', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Registar</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: '#1e3a5f', padding: '60px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Formacao online de qualidade
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 500, margin: '0 auto 32px' }}>
          Aprenda ao seu ritmo com cursos B-Learning desenvolvidos por especialistas.
        </p>
        <Link href="/registo" style={{ background: '#f5a623', color: '#fff', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontSize: 16, fontWeight: 700 }}>
          Comecar agora
        </Link>
      </div>

      {/* Catalogo */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 40px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', marginBottom: 32 }}>
          Cursos disponiveis
        </h2>

        {courses && courses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {courses.map((course: any) => (
              <Link key={course.id} href={`/curso/${course.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8edf3', overflow: 'hidden', transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: 180, background: 'linear-gradient(135deg, #1e3a5f, #4a90d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📚</div>
                  )}
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: typeColor[course.type], color: typeText[course.type] }}>
                        {typeLabel[course.type]}
                      </span>
                      {course.type === 'paid' && (
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{course.price}€</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>{course.title}</h3>
                    {course.description && (
                      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description}
                      </p>
                    )}
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      {course.access_days} dias de acesso
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <p>Nenhum curso disponivel de momento.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#1e3a5f', padding: '32px 40px', textAlign: 'center', marginTop: 40 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          tallent<span style={{ color: '#f5a623' }}>acad</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: 4, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          Plataforma B-Learning
        </div>
      </footer>
    </main>
  )
}
