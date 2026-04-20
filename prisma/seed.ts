import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create ADMIN account
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      displayName: 'System Admin',
      role: 'ADMIN',
    },
  })
  console.log('Created Admin:', admin.username)

  // 2. Create a test LEADER account
  const leaderPassword = await bcrypt.hash('leader123', 10)
  const leader = await prisma.user.upsert({
    where: { username: 'leader' },
    update: {},
    create: {
      username: 'leader',
      passwordHash: leaderPassword,
      displayName: 'Leader Test',
      role: 'LEADER',
    },
  })
  console.log('Created Leader:', leader.username)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
