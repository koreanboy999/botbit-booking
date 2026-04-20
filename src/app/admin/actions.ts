'use server'

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const token = cookies().get('session')?.value
  if (!token) throw new Error('Unauthorized')

  const session = await verifyToken(token)
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized')
}

export async function approveBooking(id: string, zoomLink: string) {
  await assertAdmin()

  if (!zoomLink) throw new Error('Zoom link is required')

  await prisma.bookingRequest.update({
    where: { id },
    data: { status: 'APPROVED', zoomLink }
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectBooking(id: string, adminNote: string) {
  await assertAdmin()

  await prisma.bookingRequest.update({
    where: { id },
    data: { status: 'CANCELLED', adminNote }
  })

  revalidatePath('/admin')
  return { success: true }
}
