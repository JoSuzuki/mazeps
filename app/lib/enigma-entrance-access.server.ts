import { createHmac, timingSafeEqual } from 'node:crypto'
import { createCookie } from 'react-router'
import type { Enigma, PrismaClient } from '~/generated/prisma/client'
import { Role } from '~/generated/prisma/enums'
import { DEFAULT_ENIGMA_ENTRANCE_PROMPT } from '~/lib/enigma-entrance-prompt'

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not defined')
}

const COOKIE_SECRET = process.env.SESSION_SECRET

export const enigmaUnlockCookie = createCookie('enigma_unlock', {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 90,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  secrets: [COOKIE_SECRET],
})

type UnlockMap = Record<string, string>

function makeUnlockToken(slug: string, enigmaId: number, passwordHash: string): string {
  const h = createHmac('sha256', `${COOKIE_SECRET}:${passwordHash}`)
  h.update(`${slug}:${enigmaId}`)
  return h.digest('hex')
}

export function defaultEntrancePasswordPrompt(): string {
  return DEFAULT_ENIGMA_ENTRANCE_PROMPT
}

export function resolveEntrancePrompt(enigma: Pick<Enigma, 'entrancePasswordPrompt'>): string {
  const t = enigma.entrancePasswordPrompt?.trim()
  return t && t.length > 0 ? t : DEFAULT_ENIGMA_ENTRANCE_PROMPT
}

export function enigmaRequiresEntrancePassword(
  enigma: Pick<Enigma, 'entrancePasswordHash'>,
): boolean {
  return Boolean(enigma.entrancePasswordHash)
}

/** ADMIN e STAFF entram sem senha (alinha com outras áreas internas do site). */
export function userBypassesEnigmaPasswordGate(role: string | undefined): boolean {
  if (role == null || role === '') return false
  const r = String(role).trim().toUpperCase()
  return r === Role.ADMIN || r === Role.STAFF
}

export async function parseEnigmaUnlockMap(
  request: Request,
): Promise<UnlockMap | null> {
  const raw = await enigmaUnlockCookie.parse(request.headers.get('Cookie'), {})
  if (!raw || typeof raw !== 'object') return null
  return raw as UnlockMap
}

export function verifyEnigmaUnlockFromMap(
  map: UnlockMap | null,
  slug: string,
  enigmaId: number,
  passwordHash: string,
): boolean {
  if (!map) return false
  const token = map[slug]
  if (typeof token !== 'string') return false
  const expected = makeUnlockToken(slug, enigmaId, passwordHash)
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}

/** Sessão pode estar desatualizada após mudança de papel no banco. */
export async function userBypassesEnigmaPasswordGateLive(
  prisma: PrismaClient,
  currentUser: { id: number | string; role?: string } | undefined,
): Promise<boolean> {
  if (userBypassesEnigmaPasswordGate(currentUser?.role)) return true
  if (currentUser == null) return false
  const id = Number(currentUser.id)
  if (!Number.isFinite(id)) return false
  const row = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  })
  return userBypassesEnigmaPasswordGate(row?.role)
}

/** Só ADMIN ignora o cookie de parabéns / mais-por-vir. STAFF segue o fluxo como jogador. */
export function userBypassesEnigmaCelebrationPreviewGate(
  role: string | undefined,
): boolean {
  if (role == null || role === '') return false
  return String(role).trim().toUpperCase() === Role.ADMIN
}

export async function hasEnigmaPlayAccess(
  request: Request,
  enigma: Pick<Enigma, 'id' | 'slug' | 'entrancePasswordHash'>,
  userRole: string | undefined,
): Promise<boolean> {
  if (!enigma.entrancePasswordHash) return true

  if (userBypassesEnigmaPasswordGate(userRole)) return true

  const map = await parseEnigmaUnlockMap(request)
  return verifyEnigmaUnlockFromMap(map, enigma.slug, enigma.id, enigma.entrancePasswordHash)
}

export async function setEnigmaUnlockCookieHeader(
  request: Request,
  slug: string,
  enigmaId: number,
  passwordHash: string,
): Promise<string> {
  const prev = await parseEnigmaUnlockMap(request)
  const next: UnlockMap = { ...(prev ?? {}), [slug]: makeUnlockToken(slug, enigmaId, passwordHash) }
  return enigmaUnlockCookie.serialize(next)
}

/** Evita open redirect: só caminhos sob este enigma. */
export function safeEnigmaInternalPath(slug: string, next: string | null): string {
  const base = `/enigmas/${slug}`
  if (!next || typeof next !== 'string' || !next.startsWith('/')) {
    return `${base}/entrada`
  }
  const trimmed = next.split('?')[0] ?? ''
  if (trimmed === base || trimmed === `${base}/`) return base
  if (!trimmed.startsWith(`${base}/`)) return `${base}/entrada`
  if (trimmed.includes('..')) return `${base}/entrada`
  return trimmed
}
