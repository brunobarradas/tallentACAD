'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegistoPage() {
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    email: '',
    password: '',
    confirmar: '',
    nif: '',
    telefone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      // gerar slug automaticamente a partir do nome
      ...(name === 'nome' ? { slug: value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') } : {})
    }))
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

    // Criar entidade via API
    const res = await fetch('/api/auth/registo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        slug: form.slug,
        email: form.email,
        password: form.password,
        nif: form.nif,
        telefone: form.telefone,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    // Login automático após registo
    const supabase = createClient()
    await supabase.auth.signInWithPassword({ email: form.email, password: form.password })

    router.push('/admin')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '40px 20px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 520, border: '1px solid #e8edf3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#4a90d9', textTransform: 'uppercase', marginTop: 4 }}>
            Plataforma B-Learning
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 4, textAlign: 'center' }}>
          Registo de Entidade
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 8 }}>
          Trial gratuito de 15 dias — sem cartao de credito
        </p>

        {/* Destaque trial */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', marginBottom: 24, fontSize: 12, color: '#0369a1', textAlign: 'center' }}>
          5 cursos · 100 formandos · 15 dias gratuitos
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nome da entidade */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Nome da Entidade *
            </label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              placeholder="Ex: Formacao XYZ Lda"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Slug */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Identificador unico (URL) *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ padding: '10px 12px', background: '#f0f4f8', border: '1px solid #e8edf3', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                tallentacad.com/
              </span>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                placeholder="formacaoxyz"
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: '0 8px 8px 0', fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>Apenas letras minusculas e numeros, sem espacos</div>
          </div>

          {/* NIF e Telefone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>NIF</label>
              <input
                name="nif"
                value={form.nif}
                onChange={handleChange}
                placeholder="123456789"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Telefone</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="+351 900 000 000"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="admin@empresa.pt"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Confirmar *</label>
              <input
                type="password"
                name="confirmar"
                value={form.confirmar}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: loading ? '#9ab3cc' : '#f5a623', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}
          >
            {loading ? 'A criar conta...' : 'Iniciar Trial Gratuito'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#6b7280' }}>
          Ja tem conta?{' '}
          <a href="/login" style={{ color: '#4a90d9', textDecoration: 'none', fontWeight: 600 }}>
            Entrar
          </a>
        </div>
      </div>
    </main>
  )
}
