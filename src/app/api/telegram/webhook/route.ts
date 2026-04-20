import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMessage, notifyAdminNewLeader } from '@/lib/telegram'
import * as bcrypt from 'bcryptjs'

// Telegram Bot Webhook Handler
export async function POST(req: NextRequest) {
  const body = await req.json()

  // Handle callback queries (inline button clicks)
  if (body.callback_query) {
    const cb = body.callback_query
    const chatId = String(cb.message.chat.id)
    const data = cb.data as string

    // Language selection: data = "lang_en", "lang_vi", etc.
    if (data.startsWith('lang_')) {
      const lang = data.replace('lang_', '')

      // Check if user already registered
      const existing = await prisma.user.findUnique({ where: { telegramChatId: chatId } })
      if (existing) {
        await sendMessage(chatId, `✅ You are already registered as <b>${existing.displayName}</b>.\n\nUsername: <code>${existing.username}</code>\nPlease login on the web portal.`)
        return NextResponse.json({ ok: true })
      }

      // Create/update session
      await prisma.telegramSession.upsert({
        where: { chatId },
        create: { chatId, step: 'USERNAME', data: JSON.stringify({ lang }) },
        update: { step: 'USERNAME', data: JSON.stringify({ lang }) },
      })

      const msgs: Record<string, string> = {
        en: '👤 Please type your desired <b>display name</b> (e.g. "John Smith"):',
        vi: '👤 Vui lòng nhập <b>tên hiển thị</b> của bạn (VD: "Nguyễn Văn A"):',
        hi: '👤 कृपया अपना <b>प्रदर्शन नाम</b> टाइप करें (जैसे "राहुल शर्मा"):',
        zh: '👤 请输入您的<b>显示名称</b>（例如 "张三"）:',
        ru: '👤 Введите ваше <b>имя</b> (например "Иван Иванов"):',
      }
      await sendMessage(chatId, msgs[lang] || msgs.en)
    }

    return NextResponse.json({ ok: true })
  }

  // Handle text messages
  if (body.message?.text) {
    const chatId = String(body.message.chat.id)
    const text = body.message.text.trim()

    // /start command
    if (text === '/start') {
      // Check if already registered
      const existing = await prisma.user.findUnique({ where: { telegramChatId: chatId } })
      if (existing) {
        await sendMessage(chatId, `✅ Welcome back, <b>${existing.displayName}</b>!\n\nYou are already registered.\nUsername: <code>${existing.username}</code>`)
        return NextResponse.json({ ok: true })
      }

      await sendMessage(chatId,
        `🤖 <b>Welcome to BotBit Meeting Bot!</b>\n\nPlease select your language:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🇬🇧 English', callback_data: 'lang_en' },
                { text: '🇻🇳 Tiếng Việt', callback_data: 'lang_vi' },
              ],
              [
                { text: '🇮🇳 हिन्दी', callback_data: 'lang_hi' },
                { text: '🇨🇳 中文', callback_data: 'lang_zh' },
              ],
              [
                { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
              ],
            ]
          }
        }
      )
      return NextResponse.json({ ok: true })
    }

    // Check if in registration flow
    const session = await prisma.telegramSession.findUnique({ where: { chatId } })
    if (!session) {
      await sendMessage(chatId, 'Please type /start to begin.')
      return NextResponse.json({ ok: true })
    }

    const sessionData = JSON.parse(session.data)

    if (session.step === 'USERNAME') {
      // Save display name, ask for username
      sessionData.displayName = text
      await prisma.telegramSession.update({
        where: { chatId },
        data: { step: 'LOGIN_USERNAME', data: JSON.stringify(sessionData) }
      })

      const msgs: Record<string, string> = {
        en: `✅ Name: <b>${text}</b>\n\nNow type your desired <b>login username</b> (no spaces, e.g. "john123"):`,
        vi: `✅ Tên: <b>${text}</b>\n\nBây giờ nhập <b>tên đăng nhập</b> (không dấu cách, VD: "nguyen123"):`,
        hi: `✅ नाम: <b>${text}</b>\n\nअब अपना <b>लॉगिन यूज़रनेम</b> टाइप करें (जैसे "rahul123"):`,
        zh: `✅ 姓名: <b>${text}</b>\n\n请输入您的<b>登录用户名</b>（无空格，例如 "zhang123"）:`,
        ru: `✅ Имя: <b>${text}</b>\n\nВведите желаемый <b>логин</b> (без пробелов, например "ivan123"):`,
      }
      await sendMessage(chatId, msgs[sessionData.lang] || msgs.en)

    } else if (session.step === 'LOGIN_USERNAME') {
      // Validate username
      const username = text.toLowerCase().replace(/\s/g, '')
      const exists = await prisma.user.findUnique({ where: { username } })
      if (exists) {
        const msgs: Record<string, string> = {
          en: `❌ Username "<b>${username}</b>" is already taken. Please try another:`,
          vi: `❌ Tên đăng nhập "<b>${username}</b>" đã tồn tại. Vui lòng chọn tên khác:`,
          hi: `❌ यूज़रनेम "<b>${username}</b>" पहले से लिया हुआ है। कृपया दूसरा प्रयास करें:`,
          zh: `❌ 用户名 "<b>${username}</b>" 已被使用。请尝试其他:`,
          ru: `❌ Логин "<b>${username}</b>" уже занят. Попробуйте другой:`,
        }
        await sendMessage(chatId, msgs[sessionData.lang] || msgs.en)
        return NextResponse.json({ ok: true })
      }

      sessionData.username = username
      await prisma.telegramSession.update({
        where: { chatId },
        data: { step: 'PASSWORD', data: JSON.stringify(sessionData) }
      })

      const msgs: Record<string, string> = {
        en: `✅ Username: <b>${username}</b>\n\nNow type your <b>password</b> (min 6 characters):`,
        vi: `✅ Tên đăng nhập: <b>${username}</b>\n\nBây giờ nhập <b>mật khẩu</b> (tối thiểu 6 ký tự):`,
        hi: `✅ यूज़रनेम: <b>${username}</b>\n\nअब अपना <b>पासवर्ड</b> टाइप करें (कम से कम 6 अक्षर):`,
        zh: `✅ 用户名: <b>${username}</b>\n\n请输入您的<b>密码</b>（至少6个字符）:`,
        ru: `✅ Логин: <b>${username}</b>\n\nВведите <b>пароль</b> (минимум 6 символов):`,
      }
      await sendMessage(chatId, msgs[sessionData.lang] || msgs.en)

    } else if (session.step === 'PASSWORD') {
      if (text.length < 6) {
        const msgs: Record<string, string> = {
          en: '❌ Password too short. Please enter at least 6 characters:',
          vi: '❌ Mật khẩu quá ngắn. Vui lòng nhập ít nhất 6 ký tự:',
          hi: '❌ पासवर्ड बहुत छोटा है। कम से कम 6 अक्षर दर्ज करें:',
          zh: '❌ 密码太短。请输入至少6个字符:',
          ru: '❌ Пароль слишком короткий. Введите минимум 6 символов:',
        }
        await sendMessage(chatId, msgs[sessionData.lang] || msgs.en)
        return NextResponse.json({ ok: true })
      }

      // Create user
      const passwordHash = await bcrypt.hash(text, 10)
      await prisma.user.create({
        data: {
          username: sessionData.username,
          displayName: sessionData.displayName,
          passwordHash,
          role: 'LEADER',
          telegramChatId: chatId,
        }
      })

      // Clean up session
      await prisma.telegramSession.delete({ where: { chatId } })

      // Notify admin
      await notifyAdminNewLeader(sessionData.username, sessionData.displayName)

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'your-app.vercel.app'
      const msgs: Record<string, string> = {
        en: `🎉 <b>Registration Complete!</b>\n\n👤 Name: ${sessionData.displayName}\n🔑 Username: <code>${sessionData.username}</code>\n🔒 Password: <i>(the one you just typed)</i>\n\n🌐 Login here: ${appUrl}\n\nYou will receive notifications about your meeting requests here.`,
        vi: `🎉 <b>Đăng ký thành công!</b>\n\n👤 Tên: ${sessionData.displayName}\n🔑 Tên đăng nhập: <code>${sessionData.username}</code>\n🔒 Mật khẩu: <i>(vừa nhập ở trên)</i>\n\n🌐 Đăng nhập tại: ${appUrl}\n\nBạn sẽ nhận thông báo về lịch họp tại đây.`,
        hi: `🎉 <b>पंजीकरण पूर्ण!</b>\n\n👤 नाम: ${sessionData.displayName}\n🔑 यूज़रनेम: <code>${sessionData.username}</code>\n🔒 पासवर्ड: <i>(जो आपने अभी टाइप किया)</i>\n\n🌐 लॉगिन: ${appUrl}\n\nआपको मीटिंग के बारे में यहाँ नोटिफिकेशन मिलेंगे।`,
        zh: `🎉 <b>注册成功！</b>\n\n👤 姓名: ${sessionData.displayName}\n🔑 用户名: <code>${sessionData.username}</code>\n🔒 密码: <i>(您刚输入的)</i>\n\n🌐 登录: ${appUrl}\n\n您将在此收到会议通知。`,
        ru: `🎉 <b>Регистрация завершена!</b>\n\n👤 Имя: ${sessionData.displayName}\n🔑 Логин: <code>${sessionData.username}</code>\n🔒 Пароль: <i>(который вы только что ввели)</i>\n\n🌐 Вход: ${appUrl}\n\nВы будете получать уведомления о встречах здесь.`,
      }
      await sendMessage(chatId, msgs[sessionData.lang] || msgs.en)
    }
  }

  return NextResponse.json({ ok: true })
}
