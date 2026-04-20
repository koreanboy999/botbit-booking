import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BookingForm from './BookingForm'
import LogoutButton from '@/components/LogoutButton'
import Calendar from '@/components/Calendar'

export default async function LeaderDashboard() {
  const token = cookies().get('session')?.value
  if (!token) redirect('/login')

  const session = await verifyToken(token)
  if (!session || session.role !== 'LEADER') redirect('/login')

  const bookings = await prisma.bookingRequest.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' }
  })

  const calendarBookings = bookings.map(b => ({
    id: b.id,
    meetingType: b.meetingType,
    preferredTime: b.preferredTime.toISOString(),
    reason: b.reason,
    status: b.status,
    zoomLink: b.zoomLink,
    adminNote: b.adminNote,
  }))

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
            BBCC<span className="text-muted-foreground">::</span>Leader Panel
          </h1>
          <p className="text-sm text-foreground/60 mt-1">Welcome back, {session.displayName}</p>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Calendar View */}
        <Calendar bookings={calendarBookings} role="LEADER" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Request Form */}
          <div className="lg:col-span-1">
            <BookingForm />
          </div>

          {/* Right Col: Request History */}
          <div className="lg:col-span-2">
            <div className="bg-card shadow-glow-sm rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold font-display text-foreground mb-6">Your Booking History</h2>
              
              {bookings.length === 0 ? (
                <div className="text-center p-10 border border-dashed border-border rounded-lg text-muted-foreground">
                  No past bookings found. Submit a request to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="p-3 rounded-tl-md">Time Requested</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 rounded-tr-md">Zoom / Notes</th>
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
