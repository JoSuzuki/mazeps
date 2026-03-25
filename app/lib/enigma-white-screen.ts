export type WhiteScreenHint = {
  trigger: string
  popupText: string
}

/** Seguro para o cliente (só JSON) — valores iniciais do formulário. */
export function parseWhiteScreenHintsJson(v: unknown): WhiteScreenHint[] {
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v) as unknown
      return parseWhiteScreenHintsJson(parsed)
    } catch {
      return []
    }
  }
  if (!Array.isArray(v)) return []
  return v
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const trigger = typeof o.trigger === 'string' ? o.trigger : ''
      const popupText = typeof o.popupText === 'string' ? o.popupText : ''
      return { trigger, popupText }
    })
    .filter((x): x is WhiteScreenHint => x != null && x.trigger.trim().length > 0)
}
