/**
 * Dados enviados ao browser na jogada: sem `answer` (validação só no servidor).
 * Mantém `answerLength` para a dica de caracteres na UI.
 */
export function toPublicEnigmaPhase<
  T extends { answer: string; hiddenHint?: string | null },
>(phase: T) {
  const { answer, hiddenHint, ...rest } = phase
  const hint = hiddenHint?.trim()
  return {
    ...rest,
    hiddenHint: hint ? hint : null,
    answerLength: answer.length,
  }
}

/** Só o necessário para a tela de jogar / parabéns (evita vazar `phases[].answer`). */
export function toPublicEnigmaPlay(enigma: { name: string }) {
  return { name: enigma.name }
}
