import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import ActionButtons from './ActionButtons'

export default async function AdminDashboard() {
  const token = cookies().get('session')?.value
  if (!token) redirect('/login')

  const session = await verifyToken(token)
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const bookings = await prisma.bookingRequest.findMany({
    include: {
      user: {
        select: { displayName: true, username: true }
      }
    },
    orderBy: [
      { status: 'asc' }, // PENDING comes first usually alphabetically, but wait: APPROVED, CANCELLED, PENDING. Let's order by createdAt.
      { createdAt: 'desc' }
    ]
  })

  // Grouping for better UI
  const pending = bookings.filter(b => b.status === 'PENDING')
  const completed = bookings.filter(b => b.status !== 'PENDING')

  const renderTable = (list: typeof bookings, showActions: boolean) => {
    if (list.length === 0) return <div className="text-muted-foreground p-4 italic text-sm">No bookings in this category.</div>
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3">Leader</th>
              <th className="p-3">Time</th>
              <th className="p-3">Type</th>
              <th className="p-3">Reason</th>
              {showActions ? (
                <th className="p-3">Action</th>
              ) : (
                <th className="p-3">Status / Note</th>
              )}
            </tr>
          </thead>
          <tbody>
            {list.map(b => (
              <tr key={b.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-3 font-semibold text-foreground">{b.user.displayName} <br/><span className="text-xs text-muted-foreground font-normal">@{b.user.username}</span></td>
                <td className="p-3 whitespace-nowrap">{new Date(b.preferredTime).toLocaleString()}</td>
                <td className="p-3">{b.meetingType}</td>
                <td className="p-3 max-w-[200px] truncate" title={b.reason}>{b.reason}</td>
                <td className="p-3">
                  {showActions ? (
                    <ActionButtons id={b.id} />
                  ) : (
                    <div>
                      {b.status === 'APPROVED' ? <span className="text-primary font-semibold text-xs">APPROVED</span> : <span className="text-destructive font-semibold text-xs">CANCELLED</span>}
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
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
            BBCC<span className="text-muted-foreground">::</span>Director Hub
          </h1>
          <p className="text-sm text-foreground/60 mt-1">Manage VIP Meeting Requests</p>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        <div className="bg-card shadow-glow-sm rounded-xl p-6 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-primary h-full"></div>
          <h2 className="text-xl font-bold font-display text-foreground mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
            Action Required ({pending.length})
          </h2>
          {renderTable(pending, true)}
        </div>

        <div className="bg-card shadow-glow-sm rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold font-display text-foreground mb-6 text-muted-foreground">
            Processed History
          </h2>
          {renderTable(completed, false)}
        </div>
      </main>
    </div>
  )
}
