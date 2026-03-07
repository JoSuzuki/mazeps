export function toYouTubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url)

    // Already an embed URL
    if (parsed.pathname.startsWith('/embed/')) return url

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return `https://www.youtube.com/embed/${id}`
    }

    // youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
    }
  } catch {
    // Not a valid URL, return as-is
  }

  return url
}
