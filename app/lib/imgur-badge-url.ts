/**
 * Normaliza e valida URL https hospedada em domínio imgur (para usar em <img src>).
 */
export function normalizeImgurBadgeUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  const host = url.hostname.toLowerCase()
  if (!host.endsWith('imgur.com')) return null
  return url.href
}
