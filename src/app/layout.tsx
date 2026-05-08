import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TallentAcad — Plataforma B-Learning',
  description: 'Plataforma de formação B-Learning para empresas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
