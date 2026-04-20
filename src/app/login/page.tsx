'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/providers/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(t('login.error'))
      setLoading(false)
      return
    }

    if (data.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/leader')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative">
      {/* Language switcher top-right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-glow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <h1 className="text-2xl font-bold text-center mb-2 font-display text-primary">{t('login.title')}</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">{t('login.subtitle')}</p>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/80">{t('login.username')}</label>
            <input
              type="text"
              className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login.placeholder_user')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/80">{t('login.password')}</label>
            <input
              type="password"
              className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.placeholder_pass')}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-60 text-primary-foreground font-semibold py-2.5 rounded-md mt-6 transition-all disabled:opacity-50"
          >
            {loading ? t('login.loading') : t('login.button')}
          </button>
        </form>
      </div>
    </div>
  )
}
