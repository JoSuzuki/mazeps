import { parseWhiteScreenHintsJson } from '~/lib/enigma-white-screen'

export function normalizeEnigmaAnswerInput(str: string) {
  return str.trim().toLowerCase()
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
