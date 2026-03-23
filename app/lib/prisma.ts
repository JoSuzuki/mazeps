import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

// Em dev não guardamos no global: depois de `prisma generate`, o processo antigo
// ainda usava um client sem campos novos (ex.: isSupporter) até reiniciar o servidor.
const prisma =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ??= new PrismaClient({ adapter }))
    : new PrismaClient({ adapter })

export default prisma
