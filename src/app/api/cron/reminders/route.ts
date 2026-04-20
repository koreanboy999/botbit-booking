import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminder } from '@/lib/telegram'

// Called by external cron (cron-job.org) every 10 minutes
// Finds APPROVED meetings happening in ~30 minutes and sends reminder
export async function GET(req: NextRequest) {
  // Simple auth via secret header
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const thirtyMinLater = new Date(now.getTime() + 35 * 60 * 1000) // 35 min window
  const twentyFiveMinLater = new Date(now.getTime() + 25 * 60 * 1000) // 25 min minimum

  // Find approved bookings in the 25-35 minute window that haven't been reminded
  const upcoming = await prisma.bookingRequest.findMany({
    where: {
      status: 'APPROVED',
      reminderSent: false,
      preferredTime: {
        gte: twentyFiveMinLater,
        lte: thirtyMinLater,
      }
    },
    include: {
      user: { select: { telegramChatId: true } }
    }
  })

  let sent = 0
  for (const booking of upcoming) {
    if (booking.user.telegramChatId) {
      await sendReminder(
        booking.user.telegramChatId,
        booking.meetingType,
        booking.preferredTime,
        booking.zoomLink
      )
      sent++
    }

    // Mark as reminded regardless (avoid duplicate sends)
    await prisma.bookingRequest.update({
      where: { id: booking.id },
      data: { reminderSent: true }
    })
  }

  return NextResponse.json({
    ok: true,
    checked: upcoming.length,
    remindersSent: sent,
    timestamp: now.toISOString()
  })
}
