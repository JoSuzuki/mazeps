import { randomBytes } from 'node:crypto'
import type { PrismaClient } from '~/generated/prisma/client'

const TOKEN_BYTE_LENGTH = 16

/** Token opaco para `/enigmas/:slug/:phaseKey` (32 hex, URL-safe). */
export function generateEnigmaPhasePathToken(): string {
  return randomBytes(TOKEN_BYTE_LENGTH).toString('hex')
}

/** Gera token único por enigma (colisão só em teoria). */
export async function allocateUniquePlayPathToken(
  prisma: PrismaClient,
  enigmaId: number,
): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const token = generateEnigmaPhasePathToken()
    const existing = await prisma.enigmaPhase.findFirst({
      where: { enigmaId, playPathToken: token },
      select: { id: true },
    })
    if (!existing) return token
  }
  throw new Error('Não foi possível gerar playPathToken único')
}
