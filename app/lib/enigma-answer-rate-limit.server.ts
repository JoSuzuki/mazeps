import { getClientIp } from '~/lib/request-ip.server'

/** Janela deslizante: tentativas de resposta por IP + enigma. */
const WINDOW_MS = 60_000
const MAX_ATTEMPTS = 24

const buckets = new Map<string, number[]>()

function trimBucket(key: string, now: number): number[] {
  const arr = buckets.get(key) ?? []
  return arr.filter((t) => now - t < WINDOW_MS)
}

/**
 * @returns `false` se excedeu o limite (ação deve responder 429 / mensagem).
 */
export function allowEnigmaAnswerAttempt(request: Request, slug: string): boolean {
  const ip = getClientIp(request)
  const key = `${ip}:${slug}`
  const now = Date.now()
  const recent = trimBucket(key, now)
  if (recent.length >= MAX_ATTEMPTS) {
    buckets.set(key, recent)
    return false
  }
  recent.push(now)
  buckets.set(key, recent)

  /** Evictar chaves mais antigas no Map — nunca limpar tudo (resetava limites de todos os IPs). */
  if (buckets.size > 15_000) {
    const target = 10_000
    while (buckets.size > target) {
      const k = buckets.keys().next().value
      if (k === undefined) break
      buckets.delete(k)
    }
  }
  return true
}
