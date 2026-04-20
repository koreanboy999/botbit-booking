'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/providers/LanguageProvider'

export default function LogoutButton() {
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 border border-destructive/50 text-destructive rounded-md hover:bg-destructive/10 transition-colors text-sm"
    >
      {t('common.logout')}
    </button>
  )
}
