import type { MediaType } from '~/generated/prisma/enums'

export type ExtraMediaBlock = {
  mediaType: MediaType
  mediaUrl: string | null
  imageFile: string | null
  imageAlt: string | null
}

function tryParseJsonArray(v: unknown): unknown[] | null {
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v) as unknown
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

export function parseStringArrayJson(v: unknown): string[] {
  const arr = tryParseJsonArray(v)
  if (!arr) return []
  return arr.filter((x): x is string => typeof x === 'string')
}

export function parseExtraMediaBlocksJson(v: unknown): ExtraMediaBlock[] {
  const arr = tryParseJsonArray(v)
  if (!arr) return []
  return arr
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const t = o.mediaType
      if (t !== 'NONE' && t !== 'IMAGE' && t !== 'VIDEO' && t !== 'AUDIO') return null
      return {
        mediaType: t as MediaType,
        mediaUrl: typeof o.mediaUrl === 'string' ? o.mediaUrl : null,
        imageFile: typeof o.imageFile === 'string' ? o.imageFile : null,
        imageAlt: typeof o.imageAlt === 'string' ? o.imageAlt : null,
      }
    })
    .filter((x): x is ExtraMediaBlock => x != null)
}
