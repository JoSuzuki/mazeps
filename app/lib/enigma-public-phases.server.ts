import type { Enigma } from '~/generated/prisma/client'
import { Role } from '~/generated/prisma/enums'

export function resolvePublicPhaseOrderBounds(
  enigma: Pick<Enigma, 'publicPhaseOrderFrom' | 'publicPhaseOrderTo'>,
  phaseOrdersAsc: number[],
): { from: number; to: number } {
  if (phaseOrdersAsc.length === 0) {
    return { from: 1, to: 1 }
  }
  const gmin = Math.min(...phaseOrdersAsc)
  const gmax = Math.max(...phaseOrdersAsc)
  return {
    from: enigma.publicPhaseOrderFrom ?? gmin,
    to: enigma.publicPhaseOrderTo ?? gmax,
  }
}

/** Só ADMIN vê todas as fases; STAFF e visitantes seguem o intervalo público quando publicado. */
export function getPlayablePhasesOrdered<T extends { order: number }>(
  enigma: Pick<Enigma, 'published' | 'publicPhaseOrderFrom' | 'publicPhaseOrderTo'>,
  phasesOrderedAsc: T[],
  userRole: string | undefined,
): T[] {
  if (userRole === Role.ADMIN) {
    return phasesOrderedAsc
  }
  if (!enigma.published) {
    return []
  }
  const bounds = resolvePublicPhaseOrderBounds(
    enigma,
    phasesOrderedAsc.map((p) => p.order),
  )
  if (bounds.from > bounds.to) {
    return []
  }
  return phasesOrderedAsc.filter(
    (p) => p.order >= bounds.from && p.order <= bounds.to,
  )
}

/** Há fases no enigma com ordem acima da última fase do intervalo público (ou da janela jogável). */
export function hasMorePhasesAfterPlayableWindow<T extends { order: number }>(
  allPhasesOrderedAsc: readonly T[],
  playableOrderedAsc: readonly T[],
): boolean {
  if (allPhasesOrderedAsc.length === 0) return false
  if (playableOrderedAsc.length === 0) {
    return allPhasesOrderedAsc.length > 0
  }
  const lastPlayableOrder = playableOrderedAsc[playableOrderedAsc.length - 1]!.order
  return allPhasesOrderedAsc.some((p) => p.order > lastPlayableOrder)
}

export function countPublicPlayablePhases(
  enigma: Pick<
    Enigma,
    'published' | 'publicPhaseOrderFrom' | 'publicPhaseOrderTo'
  >,
  phaseOrders: number[],
): number {
  if (!enigma.published || phaseOrders.length === 0) {
    return 0
  }
  const bounds = resolvePublicPhaseOrderBounds(enigma, phaseOrders)
  if (bounds.from > bounds.to) {
    return 0
  }
  return phaseOrders.filter((o) => o >= bounds.from && o <= bounds.to).length
}
