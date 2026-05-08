'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email ou password incorretos.')
      setLoading(false)
      return
    }

    // Verificar papel do utilizador
    const { data: tenantUser } = await supabase
      .from('tenant_users')
      .select('role, tenant_id, tenants(slug, is_owner)')
      .eq('auth_user_id', data.user.id)
      .single()

    if (!tenantUser) {
      setError('Utilizador nao encontrado. Contacte o suporte.')
      setLoading(false)
      return
    }

    const tenant = Array.isArray(tenantUser.tenants) ? tenantUser.tenants[0] : tenantUser.tenants as any

    // Redirecionar conforme papel
    if (tenant?.is_owner || tenantUser.role === 'admin' || tenantUser.role === 'instructor') {
      router.push('/admin')
    } else {
      router.push(`/${tenant?.slug}`)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420, border: '1px solid #e8edf3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1e3a5f' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#4a90d9', textTransform: 'uppercase', marginTop: 4 }}>
            Plataforma B-Learning
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 8, textAlign: 'center' }}>
          Entrar
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 28 }}>
          Aceda à sua área pessoal
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="o-seu-email@empresa.pt"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: loading ? '#9ab3cc' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#6b7280' }}>
          A sua empresa ainda nao tem conta?{' '}
          <a href="/registo" style={{ color: '#4a90d9', textDecoration: 'none', fontWeight: 600 }}>
            Registar entidade
          </a>
        </div>
      </div>
    </main>
  )
}
