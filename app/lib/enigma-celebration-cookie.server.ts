import { createHmac, timingSafeEqual } from 'node:crypto'
import { createCookie, redirect } from 'react-router'
import type { Enigma } from '~/generated/prisma/client'
import { userBypassesEnigmaCelebrationPreviewGate } from '~/lib/enigma-entrance-access.server'
import {
  getPlayablePhasesOrdered,
  hasMorePhasesAfterPlayableWindow,
} from '~/lib/enigma-public-phases.server'

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not defined')
}

const COOKIE_SECRET = process.env.SESSION_SECRET

export const enigmaCelebrationCookie = createCookie('enigma_celebration', {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  secrets: [COOKIE_SECRET],
})

export type EnigmaCelebrationKind = 'full' | 'interlude'

type CelebrationMap = Record<string, string>

function celebrationHmacKey() {
  return `${COOKIE_SECRET}:enigma_celebration`
}

export function makeCelebrationToken(
  slug: string,
  enigmaId: number,
  kind: EnigmaCelebrationKind,
): string {
  const h = createHmac('sha256', celebrationHmacKey())
  h.update(`${slug}:${enigmaId}:${kind}`)
  return h.digest('hex')
}

export async function parseCelebrationMap(
  request: Request,
): Promise<CelebrationMap | null> {
  const raw = await enigmaCelebrationCookie.parse(request.headers.get('Cookie'), {})
  if (!raw || typeof raw !== 'object') return null
  return raw as CelebrationMap
}

export function verifyCelebrationToken(
  map: CelebrationMap | null,
  slug: string,
  enigmaId: number,
  kind: EnigmaCelebrationKind,
): boolean {
  if (!map) return false
  const token = map[slug]
  if (typeof token !== 'string') return false
  const expected = makeCelebrationToken(slug, enigmaId, kind)
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}

export async function setCelebrationCookieHeader(
  request: Request,
  slug: string,
  enigmaId: number,
  kind: EnigmaCelebrationKind,
): Promise<string> {
  const prev = await parseCelebrationMap(request)
  const token = makeCelebrationToken(slug, enigmaId, kind)
  const next: CelebrationMap = { ...(prev ?? {}), [slug]: token }
  return enigmaCelebrationCookie.serialize(next)
}

/** Só ADMIN pode pré-visualizar parabéns / interlúdio sem cookie (papel da sessão). */
export async function canAccessCelebrationScreen(
  request: Request,
  currentUser: { role?: string } | undefined,
  slug: string,
  enigmaId: number,
  kind: EnigmaCelebrationKind,
): Promise<boolean> {
  if (userBypassesEnigmaCelebrationPreviewGate(currentUser?.role)) return true
  const map = await parseCelebrationMap(request)
  return verifyCelebrationToken(map, slug, enigmaId, kind)
}

type EnigmaForParabensGate = Pick<
  Enigma,
  'id' | 'published' | 'publicPhaseOrderFrom' | 'publicPhaseOrderTo'
> & {
  phases: readonly { order: number }[]
}

/**
 * Parabéns: cookie `full`, ou cookie `interlude` quando já não há fases após a janela pública
 * (ex.: redirecionamento desde /mais-por-vir após mudança de configuração).
 */
export async function canAccessParabensScreen(
  request: Request,
  currentUser: { role?: string } | undefined,
  slug: string,
  enigma: EnigmaForParabensGate,
  userRole: string | undefined,
): Promise<boolean> {
  if (userBypassesEnigmaCelebrationPreviewGate(currentUser?.role)) return true
  const playable = getPlayablePhasesOrdered(enigma, [...enigma.phases], userRole)
  const map = await parseCelebrationMap(request)
  if (verifyCelebrationToken(map, slug, enigma.id, 'full')) return true
  if (
    verifyCelebrationToken(map, slug, enigma.id, 'interlude') &&
    !hasMorePhasesAfterPlayableWindow(enigma.phases, playable)
  ) {
    return true
  }
  return false
}

export async function redirectWithCelebrationCookie(
  url: string,
  request: Request,
  slug: string,
  enigmaId: number,
  kind: EnigmaCelebrationKind,
): Promise<Response> {
  const cookie = await setCelebrationCookieHeader(request, slug, enigmaId, kind)
  return redirect(url, { headers: { 'Set-Cookie': cookie } })
}
