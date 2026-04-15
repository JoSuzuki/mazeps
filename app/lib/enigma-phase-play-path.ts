/**
 * Caminho HTTP para jogar a fase na posição `index` (0 = primeira; `orderedPhases` por `order` asc).
 * Usa `playPathToken` da fase em `index` (legado na rota ainda aceita resposta da fase anterior).
 */
export function enigmaPlayPathForPhaseIndex(
  slug: string,
  orderedPhases: readonly { playPathToken: string }[],
  index: number,
): string {
  if (index <= 0) {
    return `/enigmas/${slug}`
  }
  const phase = orderedPhases[index]
  if (!phase) {
    return `/enigmas/${slug}`
  }
  return `/enigmas/${slug}/${phase.playPathToken}`
}
