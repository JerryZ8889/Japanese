import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '假名小达人 - かな小達人',
  description: '听音选字，趣味掌握日语平假名与片假名',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background-warm">
        {children}
      </body>
    </html>
  )
}
