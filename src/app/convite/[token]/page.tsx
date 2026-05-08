'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter, useParams } from 'next/navigation'

export default function ConvitePage() {
  const params = useParams()
  const token = params.token as string
  const router = useRouter()

  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'loading' | 'info' | 'registo' | 'pagamento' | 'sucesso'>('loading')
  const [form, setForm] = useState({ nome: '', email: '', password: '', confirmar: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadInvite() {
      const res = await fetch(`/api/convites/${token}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Convite invalido ou expirado.')
        setLoading(false)
        return
      }

      setInvite(data.invite)
      setStep('info')
      if (data.invite.email) setForm(f => ({ ...f, email: data.invite.email }))
      setLoading(false)
    }
    loadInvite()
  }, [token])

  async function handleRegisto(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (form.password !== form.confirmar) {
      setError('As passwords nao coincidem.')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/convites/aceitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nome: form.nome, email: form.email, password: form.password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erro ao aceitar convite.')
      setSubmitting(false)
      return
    }

    if (data.payment_url) {
      window.location.href = data.payment_url
    } else {
      const supabase = createClient()
      await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      setStep('sucesso')
      setTimeout(() => router.push(`/${invite.tenants?.slug}`), 2000)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div style={{ color: '#6b7280' }}>A carregar convite...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '40px 20px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 460, border: '1px solid #e8edf3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {step === 'info' && invite && (
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 8, textAlign: 'center' }}>
              Convite recebido
            </h1>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 20, marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#0369a1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Curso</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{invite.courses?.title}</div>
              {invite.paid_by === 'student' && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#d97706', fontWeight: 600 }}>
                  Preco: {invite.courses?.price}€
                </div>
              )}
            </div>
            <button
              onClick={() => setStep('registo')}
              style={{ width: '100%', padding: '12px', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif' }}
            >
              Aceitar convite
            </button>
          </div>
        )}

        {step === 'registo' && (
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 20, textAlign: 'center' }}>
              Criar conta
            </h1>
            <form onSubmit={handleRegisto}>
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
                    value={form[f.name as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    required
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e8edf3', borderRadius: 8, fontSize: 13, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={submitting}
                style={{ width: '100%', padding: '12px', background: submitting ? '#9ab3cc' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', marginTop: 8 }}
              >
                {submitting ? 'A processar...' : 'Confirmar'}
              </button>
            </form>
          </div>
        )}

        {step === 'sucesso' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>Inscricao confirmada!</h1>
            <p style={{ fontSize: 13, color: '#6b7280' }}>A redirecionar para os seus cursos...</p>
          </div>
        )}
      </div>
    </main>
  )
}
