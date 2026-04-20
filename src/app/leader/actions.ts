'use server'

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { notifyAdminNewBooking } from '@/lib/telegram'

export async function createBooking(formData: FormData) {
  const token = cookies().get('session')?.value
  if (!token) throw new Error('Unauthorized')

  const session = await verifyToken(token)
  if (!session || session.role !== 'LEADER') throw new Error('Unauthorized')

  const meetingType = formData.get('meetingType') as string
  const preferredTime = new Date(formData.get('preferredTime') as string)
  const reason = formData.get('reason') as string

  if (!meetingType || !preferredTime || !reason) {
    throw new Error('Please fill out all fields')
  }

  await prisma.bookingRequest.create({
    data: {
      meetingType,
      preferredTime,
      reason,
      userId: session.id,
      status: 'PENDING'
    }
  })

  // Notify admin via Telegram
  await notifyAdminNewBooking(session.displayName, meetingType, preferredTime, reason)

  revalidatePath('/leader')
  return { success: true }
}
