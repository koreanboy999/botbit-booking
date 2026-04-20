'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 border border-destructive/50 text-destructive rounded-md hover:bg-destructive/10 transition-colors text-sm"
    >
      Logout
    </button>
  )
}
