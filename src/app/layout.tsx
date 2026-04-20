import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/providers/LanguageProvider'

const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'BotBit.cc | Secure Meeting Portal',
  description: 'Internal meeting booking system for BotBit leaders and directors.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} font-sans antialiased bg-[#0A0A0A] text-foreground min-h-screen selection:bg-primary/30`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
