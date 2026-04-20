import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

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
    user: b.user,
  }))

  return <AdminClient bookings={serialized} />
}
