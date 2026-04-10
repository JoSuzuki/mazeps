/** Tema visual da UI (home / data-theme no html). */

export const UI_THEME_COOKIE = 'mazepsTheme'

export const ALLOWED_UI_THEMES = ['flamingo', 'pegasus', 'golden'] as const
export type UiTheme = (typeof ALLOWED_UI_THEMES)[number]

export function isUiTheme(value: string | null): value is UiTheme {
  return value != null && (ALLOWED_UI_THEMES as readonly string[]).includes(value)
}

export function parseThemeFromCookie(cookieHeader: string | null): UiTheme | null {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';').map((c) => c.trim())
  for (const p of parts) {
    const prefix = `${UI_THEME_COOKIE}=`
    if (!p.startsWith(prefix)) continue
    const raw = p.slice(prefix.length)
    let v: string
    try {
      v = decodeURIComponent(raw)
    } catch {
      v = raw
    }
    if (isUiTheme(v)) return v
    return null
  }
  return null
}

export function tileIdFromTheme(theme: string | null): '1' | '2' | '3' {
  if (theme === 'pegasus') return '2'
  if (theme === 'golden') return '3'
  return '1'
}

export function themeFromTileId(id: string): UiTheme {
  if (id === '2') return 'pegasus'
  if (id === '3') return 'golden'
  return 'flamingo'
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Apenas no browser: localStorage + cookie + data-theme (fonte única ao escolher tema). */
export function persistUiTheme(theme: UiTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem('theme', theme)
  } catch {
    /* ignore */
  }
  document.cookie = `${UI_THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
}
