import {
  parseExtraMediaBlocksJson,
  parseStringArrayJson,
} from '~/lib/enigma-phase-extras'

function trimNonEmptyStrings(arr: string[]) {
  return arr.map((s) => s.trim()).filter((s) => s.length > 0)
}

/** Dados enviados ao browser na jogada: sem `answer` (validação só no servidor). */
export function toPublicEnigmaPhase<
  T extends {
    answer: string
    hiddenHint?: string | null
    extraMediaBlocks?: unknown
    extraPhrases?: unknown
    extraTipPhrases?: unknown
    extraHiddenHints?: unknown
    whiteScreenHints?: unknown
  },
>(phase: T) {
  const {
    answer: _answer,
    hiddenHint,
    extraMediaBlocks,
    extraPhrases,
    extraTipPhrases,
    extraHiddenHints,
    whiteScreenHints: _whiteScreenHints,
    ...rest
  } = phase
  const hint = hiddenHint?.trim()
  const mediaExtras = parseExtraMediaBlocksJson(extraMediaBlocks).filter(
    (b) => b.mediaType === 'NONE' || Boolean(b.mediaUrl),
  )
  return {
    ...rest,
    hiddenHint: hint ? hint : null,
    extraMediaBlocks: mediaExtras,
    extraPhrases: trimNonEmptyStrings(parseStringArrayJson(extraPhrases)),
    extraTipPhrases: trimNonEmptyStrings(parseStringArrayJson(extraTipPhrases)),
    extraHiddenHints: trimNonEmptyStrings(parseStringArrayJson(extraHiddenHints)),
  }
}

/** Só o necessário para a tela de jogar / parabéns (evita vazar `phases[].answer`). */
export function toPublicEnigmaPlay(enigma: { name: string }) {
  return { name: enigma.name }
}
