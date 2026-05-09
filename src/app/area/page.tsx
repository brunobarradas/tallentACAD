import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AreaPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: dbUser } = await admin
    .from('users')
    .select('id, name, email')
    .eq('auth_user_id', user.id)
    .single()

  if (!dbUser) redirect('/login')

  const { data: enrollments } = await admin
    .from('enrollments')
    .select(`
      id, enrolled_at, expires_at, status,
      courses (id, title, slug, thumbnail_url, type, access_days)
    `)
    .eq('user_id', dbUser.id)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: false })

  // Buscar progresso de cada inscricao
  const { data: allAccess } = await admin
    .from('lesson_access')
    .select('enrollment_id, is_completed')

  // Buscar total de licoes por curso
  const courseIds = (enrollments || []).map((e: any) => e.courses?.id).filter(Boolean)
  const { data: allLessons } = courseIds.length > 0 ? await admin
    .from('lessons')
    .select('id, course_id')
    .in('course_id', courseIds)
    .eq('status', 'published') : { data: [] }

  const lessonsByCourse = (allLessons || []).reduce((acc: Record<string, number>, l: any) => {
    acc[l.course_id] = (acc[l.course_id] || 0) + 1
    return acc
  }, {})

  const completedByEnrollment = (allAccess || []).reduce((acc: Record<string, number>, la: any) => {
    if (la.is_completed) acc[la.enrollment_id] = (acc[la.enrollment_id] || 0) + 1
    return acc
  }, {})

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <header style={{ background: '#1e3a5f', padding: '0 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ fontSize: 22, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Ola, {dbUser.name}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>Os meus cursos</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 32 }}>Bem-vindo de volta, {dbUser.name}!</p>

        {enrollments && enrollments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {enrollments.map((enrollment: any) => {
              const course = enrollment.courses
              const daysLeft = Math.ceil((new Date(enrollment.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const totalLessons = lessonsByCourse[course?.id] || 0
              const completedLessons = completedByEnrollment[enrollment.id] || 0
              const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

              return (
                <div key={enrollment.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8edf3', overflow: 'hidden' }}>
                  {course?.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: 150, background: 'linear-gradient(135deg, #1e3a5f, #4a90d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📚</div>
                  )}
                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>{course?.title}</h3>

                    {/* Barra de progresso */}
                    {totalLessons > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', marginBottom: 4 }}>
                          <span>{completedLessons}/{totalLessons} licoes</span>
                          <span>{progress}%</span>
                        </div>
                        <div style={{ background: '#f0f4f8', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                          <div style={{ background: '#f5a623', height: '100%', width: `${progress}%`, borderRadius: 99 }} />
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: 11, color: daysLeft < 7 ? '#dc2626' : '#6b7280', marginBottom: 14 }}>
                      {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Acesso expirado'}
                    </div>

                    <Link
                      href={`/area/curso/${course?.slug}`}
                      style={{ display: 'block', padding: '10px 14px', background: '#1e3a5f', color: '#fff', borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                    >
                      {progress === 100 ? 'Rever curso' : progress > 0 ? 'Continuar curso' : 'Comecar curso'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 80, background: '#fff', borderRadius: 14, border: '1px solid #e8edf3' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>Ainda nao tem cursos</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Explore o nosso catalogo e inscreva-se no seu primeiro curso.</p>
            <Link href="/" style={{ background: '#f5a623', color: '#fff', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Ver catalogo
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
