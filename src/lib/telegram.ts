const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || ''
const API = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendMessage(chatId: string, text: string, options?: { reply_markup?: object }) {
  try {
    await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...options,
      }),
    })
  } catch (err) {
    console.error('Telegram sendMessage error:', err)
  }
}

export async function notifyAdmin(text: string) {
  await sendMessage(ADMIN_CHAT_ID, text)
}

// Notify leader about booking status change
export async function notifyLeader(chatId: string, status: string, meetingType: string, preferredTime: Date, zoomLink?: string | null, adminNote?: string | null) {
  const timeStr = preferredTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  if (status === 'APPROVED') {
    await sendMessage(chatId, 
      `✅ <b>Meeting Approved!</b>\n\n` +
      `📅 ${timeStr}\n` +
      `⏱ Duration: ${meetingType}\n` +
      `🔗 Zoom: ${zoomLink || 'TBA'}\n\n` +
      `You will receive a reminder 30 minutes before.`
    )
  } else {
    await sendMessage(chatId,
      `❌ <b>Meeting Declined</b>\n\n` +
      `📅 ${timeStr}\n` +
      `⏱ Duration: ${meetingType}\n` +
      `${adminNote ? `💬 Note: ${adminNote}` : ''}\n\n` +
      `Please submit a new request if needed.`
    )
  }
}

// Notify admin about new booking request
export async function notifyAdminNewBooking(leaderName: string, meetingType: string, preferredTime: Date, reason: string) {
  const timeStr = preferredTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  await notifyAdmin(
    `📋 <b>New Meeting Request</b>\n\n` +
    `👤 Leader: ${leaderName}\n` +
    `📅 Time: ${timeStr}\n` +
    `⏱ Duration: ${meetingType}\n` +
    `📝 Reason: ${reason}\n\n` +
    `Please review on the web dashboard.`
  )
}

// Notify admin about new leader registration
export async function notifyAdminNewLeader(username: string, displayName: string) {
  await notifyAdmin(
    `🆕 <b>New Leader Registered</b>\n\n` +
    `👤 ${displayName}\n` +
    `🔑 Username: ${username}\n\n` +
    `Registered via Telegram Bot.`
  )
}

// Send meeting reminder
export async function sendReminder(chatId: string, meetingType: string, preferredTime: Date, zoomLink?: string | null) {
  const timeStr = preferredTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  await sendMessage(chatId,
    `⏰ <b>Meeting Reminder — 30 minutes!</b>\n\n` +
    `📅 ${timeStr}\n` +
    `⏱ Duration: ${meetingType}\n` +
    `${zoomLink ? `🔗 Zoom: ${zoomLink}` : ''}\n\n` +
    `Get ready! Your meeting starts soon.`
  )
}
