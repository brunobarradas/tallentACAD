import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import LicaoViewer from './licao-viewer'

type Props = { params: Promise<{ slug: string }> }

export default async function AreaCursoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  // Verificar autenticacao
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Buscar utilizador
  const { data: dbUser } = await admin
    .from('users')
    .select('id, name')
    .eq('auth_user_id', user.id)
    .single()

  if (!dbUser) redirect('/login')

  // Buscar curso
  const { data: course } = await admin
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  // Verificar inscricao ativa
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id, enrolled_at, expires_at, status')
    .eq('course_id', course.id)
    .eq('user_id', dbUser.id)
    .eq('status', 'active')
    .single()

  if (!enrollment) redirect(`/curso/${slug}`)

  // Verificar se acesso expirou
  const isExpired = new Date(enrollment.expires_at) < new Date()
  if (isExpired) redirect(`/curso/${slug}`)

  // Buscar licoes publicadas
  const { data: lessons } = await admin
    .from('lessons')
    .select('id, title, order_index, unlock_after_days, status')
    .eq('course_id', course.id)
    .eq('status', 'published')
    .order('order_index', { ascending: true })

  // Calcular dias desde inicio do curso
  const enrolledAt = new Date(enrollment.enrolled_at)
  const daysSinceEnroll = Math.floor((Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24))

  // Buscar progresso do formando
  const { data: lessonAccess } = await admin
    .from('lesson_access')
    .select('lesson_id, is_completed, completed_at')
    .eq('enrollment_id', enrollment.id)

  const accessMap = (lessonAccess || []).reduce((acc: Record<string, any>, la: any) => {
    acc[la.lesson_id] = la
    return acc
  }, {})

  const daysLeft = Math.ceil((new Date(enrollment.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const completedCount = (lessonAccess || []).filter((la: any) => la.is_completed).length
  const totalLessons = lessons?.length || 0
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <header style={{ background: '#1e3a5f', padding: '0 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/area" style={{ fontSize: 22, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Ola, {dbUser.name}</span>
            <Link href="/area" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>← Os meus cursos</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 28 }}>

        {/* Sidebar — lista de licoes */}
        <div>
          {/* Info do curso */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', padding: 20, marginBottom: 16 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>{course.title}</h1>

            {/* Progresso */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                <span>Progresso</span>
                <span>{completedCount}/{totalLessons} licoes</span>
              </div>
              <div style={{ background: '#f0f4f8', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{ background: '#f5a623', height: '100%', width: `${progress}%`, borderRadius: 99, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 11, color: '#f5a623', fontWeight: 600, marginTop: 4 }}>{progress}% concluido</div>
            </div>

            <div style={{ fontSize: 11, color: daysLeft < 7 ? '#dc2626' : '#6b7280' }}>
              ⏱ {daysLeft} dias restantes
            </div>
          </div>

          {/* Lista de licoes */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8edf3', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8edf3', fontSize: 11, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 1 }}>
              Licoes
            </div>
            {lessons && lessons.map((lesson: any, i: number) => {
              const isUnlocked = daysSinceEnroll >= lesson.unlock_after_days
              const isCompleted = accessMap[lesson.id]?.is_completed
              return (
                <div key={lesson.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  {isUnlocked ? (
                    <Link
                      href={`/area/curso/${slug}?licao=${lesson.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        textDecoration: 'none',
                        background: 'transparent',
                      }}
                    >
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: isCompleted ? '#f5a623' : '#e8edf3',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        color: isCompleted ? '#fff' : '#1e3a5f',
                      }}>
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{lesson.title}</div>
                      </div>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', opacity: 0.5 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e8edf3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                        🔒
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{lesson.title}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>Dia {lesson.unlock_after_days}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Conteudo da licao */}
        <LicaoViewer
          lessons={lessons || []}
          enrollmentId={enrollment.id}
          daysSinceEnroll={daysSinceEnroll}
          accessMap={accessMap}
        />
      </div>
    </main>
  )
}
