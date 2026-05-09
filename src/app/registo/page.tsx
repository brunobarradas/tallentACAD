'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

function RegistoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cursoSlug = searchParams.get('curso')

  const [form, setForm] = useState({ nome: '', email: '', password: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.confirmar) {
      setError('As passwords nao coincidem.')
      setLoading(false)
      return
    }
    if (form.password.length < 8) {
      setError('A password deve ter pelo menos 8 caracteres.')
      setLoading(false)
      return
    }

    // Criar conta
    const res = await fetch('/api/auth/registo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: form.nome, email: form.email, password: form.password, curso_slug: cursoSlug }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    // Se curso pago redirecionar para pagamento
    if (data.payment_url) {
      window.location.href = data.payment_url
      return
    }

    // Fazer login automatico apos registo
    const supabase = createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      // Se login falhar redirecionar para login manual
      router.push('/login')
      return
    }

    // Redirecionar para area pessoal
    router.push('/area')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '40px 20px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 440, border: '1px solid #e8edf3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', textDecoration: 'none' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </Link>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 4, textAlign: 'center' }}>Criar conta</h1>
        <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
          {cursoSlug ? 'Registe-se para aceder ao curso' : 'Aceda a todos os cursos disponiveis'}
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Nome completo', name: 'nome', type: 'text', placeholder: 'O seu nome' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'o-seu-email@exemplo.pt' },
            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
            { label: 'Confirmar password', name: 'confirmar', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.name} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name as keyof typeof form]}
                onChange={handleChange}
                required
                placeholder={f.placeholder}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: loading ? '#9ab3cc' : '#f5a623', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', marginTop: 8 }}
          >
            {loading ? 'A criar conta...' : 'Criar conta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#6b7280' }}>
          Ja tem conta?{' '}
          <Link href="/login" style={{ color: '#4a90d9', textDecoration: 'none', fontWeight: 600 }}>Entrar</Link>
        </div>
      </div>
    </main>
  )
}

export default function RegistoPage() {
  return <Suspense><RegistoForm /></Suspense>
}
