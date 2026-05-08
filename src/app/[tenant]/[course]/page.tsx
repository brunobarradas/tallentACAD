import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface Props {
  params: { tenant: string; course: string }
}

export default async function CoursePage({ params }: Props) {
  const supabase = await createServerSupabaseClient()

  // Buscar tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, logo_url')
    .eq('slug', params.tenant)
    .single()

  if (!tenant) notFound()

  // Buscar curso
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('slug', params.course)
    .eq('status', 'published')
    .single()

  if (!course) notFound()

  // Buscar lições publicadas
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .eq('status', 'published')
    .order('order_index', { ascending: true })

  const now = new Date()
  const courseStart = new Date(course.starts_at)
  const daysSinceStart = Math.floor((now.getTime() - courseStart.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href={`/${params.tenant}`} className="flex items-center gap-2 text-[#1e3a5f] hover:opacity-80">
            <span>←</span>
            <span className="font-semibold">{tenant.name}</span>
          </a>
          <a href="#" className="text-sm text-[#4a90d9] hover:underline">Entrar</a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Info do curso */}
        {course.thumbnail_url && (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-56 object-cover rounded-xl mb-6" />
        )}
        <h1 className="text-3xl font-bold text-[#1e3a5f]">{course.title}</h1>
        {course.description && (
          <p className="mt-3 text-gray-500">{course.description}</p>
        )}
        <div className="mt-4 flex gap-6 text-sm text-gray-400">
          <span>Início: {new Date(course.starts_at).toLocaleDateString('pt-PT')}</span>
          <span>Fim: {new Date(course.ends_at).toLocaleDateString('pt-PT')}</span>
          <span>{course.access_days} dias de acesso</span>
        </div>

        {/* Lições */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Conteúdo do curso</h2>
          <div className="space-y-3">
            {lessons && lessons.map((lesson, index) => {
              const isUnlocked = daysSinceStart >= lesson.unlock_after_days
              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition ${
                    isUnlocked
                      ? 'border-gray-100 hover:border-[#4a90d9] cursor-pointer hover:shadow-sm'
                      : 'border-gray-100 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Número da lição */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isUnlocked ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <p className={`font-medium ${isUnlocked ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>
                      {lesson.title}
                    </p>
                    {!isUnlocked && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Disponível no dia {lesson.unlock_after_days} do curso
                      </p>
                    )}
                  </div>

                  {/* Ícone de cadeado ou seta */}
                  <span className="text-gray-300 text-lg">
                    {isUnlocked ? '→' : '🔒'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Botão de inscrição */}
        <div className="mt-10 text-center">
          <button className="px-8 py-4 bg-[#f5a623] text-white font-bold rounded-xl text-lg hover:bg-[#e8960f] transition shadow-md">
            Inscrever-me no curso
          </button>
        </div>
      </div>
    </main>
  )
}
