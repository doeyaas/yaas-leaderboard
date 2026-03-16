import type { Metadata } from 'next'
import { Barlow_Condensed } from 'next/font/google'
import './globals.css'

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
})

export const metadata: Metadata = {
  title: 'Content Leaderboard TV',
  description: 'Internal content performance leaderboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={barlow.variable}>
      <body className="antialiased bg-[#0a0a0a] overflow-hidden" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
