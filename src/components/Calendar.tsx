'use client'

import { useState, useMemo } from 'react'

interface BookingEvent {
  id: string
  meetingType: string
  preferredTime: string
  reason: string
  status: string
  zoomLink?: string | null
  adminNote?: string | null
  user?: { displayName: string; username: string }
}

interface CalendarProps {
  bookings: BookingEvent[]
  role: 'ADMIN' | 'LEADER'
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-500', border: 'border-yellow-500/30', text: 'text-yellow-500', label: 'Pending' },
  APPROVED: { color: 'bg-emerald-500', border: 'border-emerald-500/30', text: 'text-emerald-500', label: 'Approved' },
  CANCELLED: { color: 'bg-red-500/60', border: 'border-red-500/30', text: 'text-red-400', label: 'Cancelled' },
}

const meetingLabels: Record<string, string> = {
  '15m': '15 min',
  '30m': '30 min',
  '60m': '60 min',
  '>60m': '> 60 min',
}

export default function Calendar({ bookings, role }: CalendarProps) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingEvent[]> = {}
    bookings.forEach(b => {
      const d = new Date(b.preferredTime)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(b)
    })
    return map
  }, [bookings])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
    setSelectedDate(null)
  }

  const goToday = () => {
    setCurrentMonth(now.getMonth())
    setCurrentYear(now.getFullYear())
    setSelectedDate(null)
  }

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : []

  const isToday = (day: number) =>
    day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()

  return (
    <div className="bg-card rounded-xl border border-border shadow-glow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold font-display text-foreground">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToday}
            className="text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={nextMonth} className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-h-[72px] border-b border-r border-border/50 bg-muted/20" />
          }

          const dateKey = `${currentYear}-${currentMonth}-${day}`
          const dayBookings = bookingsByDate[dateKey] || []
          const isSelected = selectedDate === dateKey
          const today = isToday(day)

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(isSelected ? null : dateKey)}
              className={`min-h-[72px] p-1.5 border-b border-r border-border/50 text-left transition-all hover:bg-muted/50 relative group
                ${isSelected ? 'bg-primary/5 ring-1 ring-primary/30' : ''}
              `}
            >
              <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full
                ${today ? 'bg-primary text-black font-bold' : 'text-foreground/70 group-hover:text-foreground'}
              `}>
                {day}
              </span>

              {/* Event dots */}
              {dayBookings.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {dayBookings.slice(0, 3).map((b, i) => {
                    const cfg = statusConfig[b.status as keyof typeof statusConfig] || statusConfig.PENDING
                    return (
                      <div key={i} className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] ${cfg.color}/20 border ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.color} flex-shrink-0`}></span>
                        <span className="truncate text-foreground/80">
                          {new Date(b.preferredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                  {dayBookings.length > 3 && (
                    <span className="text-[10px] text-muted-foreground pl-1">+{dayBookings.length - 3} more</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`w-2 h-2 rounded-full ${cfg.color}`}></span>
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Selected Date Detail Panel */}
      {selectedDate && (
        <div className="border-t border-primary/20 bg-primary/5 p-4 animate-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-foreground mb-3">
            {new Date(currentYear, currentMonth, parseInt(selectedDate.split('-')[2])).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
            <span className="ml-2 text-muted-foreground font-normal">
              {selectedBookings.length === 0 ? '— No meetings' : `— ${selectedBookings.length} meeting(s)`}
            </span>
          </h3>

          {selectedBookings.length > 0 && (
            <div className="space-y-2">
              {selectedBookings.map(b => {
                const cfg = statusConfig[b.status as keyof typeof statusConfig] || statusConfig.PENDING
                return (
                  <div key={b.id} className={`flex items-start gap-3 p-3 rounded-lg bg-card border ${cfg.border}`}>
                    <div className={`w-1 self-stretch rounded-full ${cfg.color} flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {new Date(b.preferredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {meetingLabels[b.meetingType] || b.meetingType}
                        </span>
                        <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      {role === 'ADMIN' && b.user && (
                        <p className="text-xs text-foreground/70 mt-1">
                          👤 {b.user.displayName} <span className="text-muted-foreground">@{b.user.username}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.reason}</p>
                      {b.status === 'APPROVED' && b.zoomLink && (
                        <a href={b.zoomLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block font-mono">
                          🔗 {b.zoomLink}
                        </a>
                      )}
                      {b.status === 'CANCELLED' && b.adminNote && (
                        <p className="text-xs text-red-400 mt-1 italic">💬 {b.adminNote}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
