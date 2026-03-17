import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const testUsers = [
  {
    email: 'usuario1@teste.com',
    name: 'Usuário Um',
    nickname: 'usuario1',
    password: '123456',
    role: 'USER' as const,
  },
  {
    email: 'staff@teste.com',
    name: 'Staff Teste',
    nickname: 'staff',
    password: '123456',
    role: 'STAFF' as const,
  },
  {
    email: 'admin@teste.com',
    name: 'Admin Teste',
    nickname: 'admin',
    password: '123456',
    role: 'ADMIN' as const,
  },
]

async function seed() {
  for (const user of testUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        password: hashedPassword,
        role: user.role,
      },
      update: {
        name: user.name,
        nickname: user.nickname,
        password: hashedPassword,
        role: user.role,
      },
    })
    console.log(`✓ ${user.email} (${user.role})`)
  }
  console.log('\n3 usuários de teste criados!')
  console.log('Senha para todos: 123456')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
