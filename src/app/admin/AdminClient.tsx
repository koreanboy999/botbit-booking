'use client'

import { useLanguage } from '@/providers/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LogoutButton from '@/components/LogoutButton'
import Calendar from '@/components/Calendar'
import ActionButtons from './ActionButtons'

interface BookingData {
  id: string
  meetingType: string
  preferredTime: string
  reason: string
  status: string
  zoomLink: string | null
  adminNote: string | null
  user: { displayName: string; username: string }
}

interface Props {
  bookings: BookingData[]
}

export default function AdminClient({ bookings }: Props) {
  const { t } = useLanguage()

  const pending = bookings.filter(b => b.status === 'PENDING')
  const completed = bookings.filter(b => b.status !== 'PENDING')

  const renderTable = (list: BookingData[], showActions: boolean) => {
    if (list.length === 0) return <div className="text-muted-foreground p-4 italic text-sm">{t('admin.no_bookings')}</div>
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3">{t('admin.col_leader')}</th>
              <th className="p-3">{t('admin.col_time')}</th>
              <th className="p-3">{t('admin.col_type')}</th>
              <th className="p-3">{t('admin.col_reason')}</th>
              <th className="p-3">{showActions ? t('admin.col_action') : t('admin.col_status')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map(b => (
              <tr key={b.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-3 font-semibold text-foreground">
                  {b.user.displayName}<br/>
                  <span className="text-xs text-muted-foreground font-normal">@{b.user.username}</span>
                </td>
                <td className="p-3 whitespace-nowrap">{new Date(b.preferredTime).toLocaleString()}</td>
                <td className="p-3">{b.meetingType}</td>
                <td className="p-3 max-w-[200px] truncate" title={b.reason}>{b.reason}</td>
                <td className="p-3">
                  {showActions ? (
                    <ActionButtons id={b.id} />
                  ) : (
                    <div>
                      {b.status === 'APPROVED'
                        ? <span className="text-primary font-semibold text-xs">{t('cal.approved').toUpperCase()}</span>
                        : <span className="text-destructive font-semibold text-xs">{t('cal.cancelled').toUpperCase()}</span>
                      }
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]" title={b.zoomLink || b.adminNote || ''}>
                        {b.zoomLink || b.adminNote}
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
            BBCC<span className="text-muted-foreground">::</span>{t('admin.header')}
          </h1>
          <p className="text-sm text-foreground/60 mt-1">{t('admin.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <Calendar bookings={bookings} role="ADMIN" />

        <div className="bg-card shadow-glow-sm rounded-xl p-6 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-primary h-full"></div>
          <h2 className="text-xl font-bold font-display text-foreground mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
            {t('admin.action_required')} ({pending.length})
          </h2>
          {renderTable(pending, true)}
        </div>

        <div className="bg-card shadow-glow-sm rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold font-display text-foreground mb-6 text-muted-foreground">
            {t('admin.processed')}
          </h2>
          {renderTable(completed, false)}
        </div>
      </main>
    </div>
  )
}
