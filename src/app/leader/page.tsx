import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import LeaderClient from './LeaderClient'

export default async function LeaderDashboard() {
  const token = cookies().get('session')?.value
  if (!token) redirect('/login')

  const session = await verifyToken(token)
  if (!session || session.role !== 'LEADER') redirect('/login')

  const bookings = await prisma.bookingRequest.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' }
  })

  const serialized = bookings.map(b => ({
    id: b.id,
    meetingType: b.meetingType,
    preferredTime: b.preferredTime.toISOString(),
    reason: b.reason,
    status: b.status,
    zoomLink: b.zoomLink,
    adminNote: b.adminNote,
  }))

  return <LeaderClient displayName={session.displayName} bookings={serialized} />
}
