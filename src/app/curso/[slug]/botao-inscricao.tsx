'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  courseSlug: string
  courseType: string
  coursePrice: number
  isAuthenticated: boolean
  isEnrolled: boolean
}

export default function BotaoInscricao({ courseSlug, courseType, coursePrice, isAuthenticated, isEnrolled }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleInscricao() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/curso/${courseSlug}`)
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/inscricoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_slug: courseSlug }),
    })

    const data = await res.json()

    if (data.payment_url) {
      window.location.href = data.payment_url
      return
    }

    if (data.success) {
      router.push('/area?enrolled=true')
      return
    }

    if (data.enrolled) {
      router.push('/area')
      return
    }

    setError(data.error || 'Erro ao inscrever.')
    setLoading(false)
  }

  if (isEnrolled) {
    return (
      <div>
        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
          ✅ Ja esta inscrito neste curso
        </div>
        <Link href="/area" style={{ display: 'block', width: '100%', padding: '12px', background: '#1e3a5f', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' as const }}>
          Ir para a minha area
        </Link>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
          {error}
        </div>
      )}
      <button
        onClick={handleInscricao}
        disabled={loading}
        style={{ display: 'block', width: '100%', padding: '14px', background: loading ? '#9ab3cc' : '#f5a623', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', boxSizing: 'border-box' as const }}
      >
        {loading ? 'A processar...' : courseType === 'paid' ? `Comprar — ${coursePrice}€` : 'Inscrever-me'}
      </button>
      {!isAuthenticated && (
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#9ca3af' }}>
          Ja tem conta?{' '}
          <Link href={`/login?redirect=/curso/${courseSlug}`} style={{ color: '#4a90d9' }}>Entrar</Link>
        </div>
      )}
    </div>
  )
}
