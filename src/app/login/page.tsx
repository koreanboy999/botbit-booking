'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      setError(data.error || 'Failed to login')
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-glow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <h1 className="text-2xl font-bold text-center mb-2 font-display text-primary">BotBit Operations</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">Secure Meeting Portal</p>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/80">ID / Username</label>
            <input
              type="text"
              className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/80">Secret Password</label>
            <input
              type="password"
              className="w-full p-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-60 text-primary-foreground font-semibold py-2.5 rounded-md mt-6 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Terminal'}
          </button>
        </form>
      </div>
    </div>
  )
}
