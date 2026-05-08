import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorar assets e API routes internas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Extrair tenant slug do path: /empresaxpto/curso -> tenant = empresaxpto
  const segments = pathname.split('/').filter(Boolean)
  const tenantSlug = segments[0]

  if (!tenantSlug) return NextResponse.next()

  // Criar cliente Supabase no middleware
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verificar se o tenant existe
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, status')
    .eq('slug', tenantSlug)
    .single()

  // Tenant não existe ou inativo — redirecionar para 404
  if (!tenant || tenant.status !== 'active') {
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  // Injetar tenant no header para uso nas páginas
  response.headers.set('x-tenant-id', tenant.id)
  response.headers.set('x-tenant-slug', tenant.slug)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
