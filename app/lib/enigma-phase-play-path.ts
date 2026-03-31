/**
 * Caminho HTTP para jogar a fase na posição `index` (0 = primeira; `orderedPhases` por `order` asc).
 * A rota `/:slug/:phaseKey` mostra a fase seguinte à cuja `answer` corresponde `phaseKey`.
 */
export function enigmaPlayPathForPhaseIndex(
  slug: string,
  orderedPhases: readonly { answer: string }[],
  index: number,
): string {
  if (index <= 0) {
    return `/enigmas/${slug}`
  }
  const prev = orderedPhases[index - 1]
  if (!prev) {
    return `/enigmas/${slug}`
  }
  return `/enigmas/${slug}/${encodeURIComponent(prev.answer.trim())}`
}
