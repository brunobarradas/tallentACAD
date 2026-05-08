import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface Props {
  params: { tenant: string }
}

export default async function TenantPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()

  // Buscar tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', params.tenant)
    .single()

  if (!tenant) notFound()

  // Buscar cursos publicados do tenant
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('status', 'published')
    .gte('ends_at', new Date().toISOString())
    .order('starts_at', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header do tenant */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-10 object-contain" />
          ) : (
            <h1 className="text-xl font-bold text-[#1e3a5f]">{tenant.name}</h1>
          )}
          <a href="#" className="text-sm text-[#4a90d9] hover:underline">
            Entrar
          </a>
        </div>
      </header>

      {/* Lista de cursos */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-8">Cursos disponíveis</h2>

        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <a
                key={course.id}
                href={`/${params.tenant}/${course.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group"
              >
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-40 object-cover group-hover:opacity-90 transition"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-[#1e3a5f] text-lg">{course.title}</h3>
                  {course.description && (
                    <p className="mt-2 text-gray-500 text-sm line-clamp-2">{course.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>Início: {new Date(course.starts_at).toLocaleDateString('pt-PT')}</span>
                    <span>{course.access_days} dias de acesso</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Nenhum curso disponível de momento.</p>
        )}
      </section>
    </main>
  )
}
