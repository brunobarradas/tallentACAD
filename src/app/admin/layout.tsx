'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: '⊞', section: 'Super Admin' },
  { label: 'Empresas', href: '/admin/empresas', icon: '🏢', section: null },
  { label: 'Cursos', href: '/admin/cursos', icon: '📚', section: 'Empresa' },
  { label: 'Licoes', href: '/admin/licoes', icon: '📖', section: null },
  { label: 'Formandos', href: '/admin/formandos', icon: '👥', section: null },
  { label: 'Estatisticas', href: '/admin/estatisticas', icon: '📊', section: null },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Georgia, serif', background: '#f0f4f8' }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, background: '#1e3a5f', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
            tallent<span style={{ color: '#f5a623' }}>acad</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: 4 }}>
            Painel de Gestao
          </div>
        </div>

        <nav style={{ padding: '16px 0', flex: 1 }}>
          {navItems.map((item, i) => (
            <div key={i}>
              {item.section && (
                <div style={{ padding: '8px 20px 4px', fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                  {item.section}
                </div>
              )}
              <Link href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                color: pathname === item.href ? '#f5a623' : 'rgba(255,255,255,0.6)',
                background: pathname === item.href ? 'rgba(245,166,35,0.15)' : 'transparent',
                borderRight: pathname === item.href ? '3px solid #f5a623' : '3px solid transparent',
                textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'all 0.2s'
              }}>
                <span style={{ width: 18, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>B</div>
          <div>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Bruno Barradas</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Super Admin</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
