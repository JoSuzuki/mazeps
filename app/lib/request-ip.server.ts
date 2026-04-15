/** IP do cliente para rate limiting (proxies / Fly). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const fly = request.headers.get('fly-client-ip')
  if (fly?.trim()) return fly.trim()
  const real = request.headers.get('x-real-ip')
  if (real?.trim()) return real.trim()
  return 'unknown'
}
