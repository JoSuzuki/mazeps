import { normalizeEnigmaAnswerInput } from '~/lib/enigma-phase-answer.server'

export type PhaseLightForUrlResolve = {
  id: number
  order: number
  answer: string
  playPathToken: string
}

/**
 * Resolve qual fase mostrar para `/:slug/:phaseKey`.
 * 1) Match por `playPathToken` (novo).
 * 2) Legado: `phaseKey` = resposta normalizada da fase anterior na ordem global.
 */
export function resolvePhaseIdFromPlayUrlSegment(
  phasesOrderedAsc: PhaseLightForUrlResolve[],
  phaseKeyRaw: string,
): number | null {
  const trimmed = phaseKeyRaw.trim()
  if (!trimmed) return null

  const byToken = phasesOrderedAsc.find((p) => p.playPathToken === trimmed)
  if (byToken) return byToken.id

  const keyNorm = normalizeEnigmaAnswerInput(phaseKeyRaw)
  const prevIndex = phasesOrderedAsc.findIndex(
    (p) => normalizeEnigmaAnswerInput(p.answer) === keyNorm,
  )
  if (prevIndex !== -1 && prevIndex + 1 < phasesOrderedAsc.length) {
    return phasesOrderedAsc[prevIndex + 1]!.id
  }
  return null
}
