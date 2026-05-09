import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TallentAcad — Plataforma B-Learning',
  description: 'Formacao online de qualidade',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
