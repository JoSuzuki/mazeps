import { parseWhiteScreenHintsJson } from '~/lib/enigma-white-screen'

export function normalizeEnigmaAnswerInput(str: string) {
  return str.trim().toLowerCase()
}

/** Mensagem ao gravar fase cuja resposta colide com outra do mesmo enigma (após normalizar). */
export const ENIGMA_PHASE_DUPLICATE_ANSWER_ERROR =
  'Já existe uma fase com essa resposta!'

export function phaseAnswerConflictsWithSiblingPhases(
  phases: { id: number; answer: string }[],
  candidateAnswer: string,
  excludePhaseId?: number,
): boolean {
  const n = normalizeEnigmaAnswerInput(candidateAnswer)
  return phases.some(
    (p) =>
      (excludePhaseId === undefined || p.id !== excludePhaseId) &&
      normalizeEnigmaAnswerInput(p.answer) === n,
  )
}

export type PhaseAnswerResolution =
  | { kind: 'correct' }
  | { kind: 'wrong' }
  | { kind: 'whiteScreen'; message: string }

export function resolvePhaseAnswerSubmission(input: {
  submittedRaw: string
  correctAnswer: string
  whiteScreenHintsJson: unknown
}): PhaseAnswerResolution {
  const submitted = normalizeEnigmaAnswerInput(input.submittedRaw)
  const correct = normalizeEnigmaAnswerInput(input.correctAnswer)
  if (submitted === correct) return { kind: 'correct' }

  const hints = parseWhiteScreenHintsJson(input.whiteScreenHintsJson)
  for (const h of hints) {
    if (normalizeEnigmaAnswerInput(h.trigger) === submitted) {
      return { kind: 'whiteScreen', message: h.popupText }
    }
  }
  return { kind: 'wrong' }
}
