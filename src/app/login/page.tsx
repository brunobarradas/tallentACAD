'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/area'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ou password incorretos.')
      setLoading(false)
      return
    }

    // Verificar se e admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', data.user.id)
      .single()

    if (user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push(redirect)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '40px 20px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420, border: '1px solid #e8edf3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', textDecoration: 'none' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </Link>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 4, textAlign: 'center' }}>Entrar</h1>
        <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>Aceda a sua area pessoal</p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="o-seu-email@exemplo.pt"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Password</label>
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

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#6b7280' }}>
          Ainda nao tem conta?{' '}
          <Link href="/registo" style={{ color: '#4a90d9', textDecoration: 'none', fontWeight: 600 }}>Registar</Link>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
