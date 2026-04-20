'use server'

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { notifyLeader } from '@/lib/telegram'

async function assertAdmin() {
  const token = cookies().get('session')?.value
  if (!token) throw new Error('Unauthorized')

  const session = await verifyToken(token)
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized')
}

export async function approveBooking(id: string, zoomLink: string) {
  await assertAdmin()

  if (!zoomLink) throw new Error('Zoom link is required')

  const booking = await prisma.bookingRequest.update({
    where: { id },
    data: { status: 'APPROVED', zoomLink },
    include: { user: { select: { telegramChatId: true } } }
  })

  // Notify leader via Telegram
  if (booking.user.telegramChatId) {
    await notifyLeader(
      booking.user.telegramChatId,
      'APPROVED',
      booking.meetingType,
      booking.preferredTime,
      zoomLink
    )
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectBooking(id: string, adminNote: string) {
  await assertAdmin()

  const booking = await prisma.bookingRequest.update({
    where: { id },
    data: { status: 'CANCELLED', adminNote },
    include: { user: { select: { telegramChatId: true } } }
  })

  // Notify leader via Telegram
  if (booking.user.telegramChatId) {
    await notifyLeader(
      booking.user.telegramChatId,
      'CANCELLED',
      booking.meetingType,
      booking.preferredTime,
      null,
      adminNote
    )
  }

  revalidatePath('/admin')
  return { success: true }
}
