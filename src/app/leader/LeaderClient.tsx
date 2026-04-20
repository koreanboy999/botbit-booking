'use client'

import { useLanguage } from '@/providers/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LogoutButton from '@/components/LogoutButton'
import Calendar from '@/components/Calendar'
import BookingForm from './BookingForm'

interface BookingData {
  id: string
  meetingType: string
  preferredTime: string
  reason: string
  status: string
  zoomLink: string | null
  adminNote: string | null
}

interface Props {
  displayName: string
  bookings: BookingData[]
}

export default function LeaderClient({ displayName, bookings }: Props) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
            BBCC<span className="text-muted-foreground">::</span>{t('leader.header')}
          </h1>
          <p className="text-sm text-foreground/60 mt-1">{t('leader.welcome')} {displayName}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <Calendar bookings={bookings} role="LEADER" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <BookingForm />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card shadow-glow-sm rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold font-display text-foreground mb-6">{t('leader.history_title')}</h2>
              
              {bookings.length === 0 ? (
                <div className="text-center p-10 border border-dashed border-border rounded-lg text-muted-foreground">
                  {t('leader.no_bookings')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="p-3 rounded-tl-md">{t('leader.col_time')}</th>
                        <th className="p-3">{t('leader.col_type')}</th>
                        <th className="p-3">{t('leader.col_status')}</th>
                        <th className="p-3 rounded-tr-md">{t('leader.col_zoom')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3 whitespace-nowrap">
                            {new Date(b.preferredTime).toLocaleString()}
                          </td>
                          <td className="p-3">{b.meetingType}</td>
                          <td className="p-3">
                            {b.status === 'PENDING' && <span className="inline-block px-2 py-1 text-xs font-semibold bg-warning/20 text-warning border border-warning/30 rounded-md">PENDING</span>}
                            {b.status === 'APPROVED' && <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/20 text-primary border border-primary/30 rounded-md">APPROVED</span>}
                            {b.status === 'CANCELLED' && <span className="inline-block px-2 py-1 text-xs font-semibold bg-muted text-muted-foreground border border-border rounded-md">CANCELLED</span>}
                          </td>
                          <td className="p-3 max-w-[200px] truncate">
                            {b.status === 'APPROVED' && b.zoomLink ? (
                              <a href={b.zoomLink} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono text-xs break-all">
                                {b.zoomLink}
                              </a>
                            ) : b.status === 'CANCELLED' && b.adminNote ? (
                              <span className="text-muted-foreground text-xs italic">{b.adminNote}</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
