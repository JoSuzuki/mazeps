import { MediaType } from '~/generated/prisma/enums'
import type { ExtraMediaBlock } from '~/lib/enigma-phase-extras'
import type { WhiteScreenHint } from '~/lib/enigma-white-screen'
import { saveEnigmaPhaseUpload } from '~/lib/upload'
import { toYouTubeEmbedUrl } from '~/lib/youtube'

function parseIndexedStrings(formData: FormData, prefix: string): string[] {
  const n = Number(formData.get(`${prefix}_count`))
  if (!Number.isFinite(n) || n < 0) return []
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const raw = formData.get(`${prefix}_${i}`)
    if (typeof raw === 'string' && raw.trim()) out.push(raw.trim())
  }
  return out
}

export function parsePhaseTextExtrasFromForm(formData: FormData) {
  return {
    extraPhrases: parseIndexedStrings(formData, 'extraPhrase'),
    extraTipPhrases: parseIndexedStrings(formData, 'extraTipPhrase'),
    extraHiddenHints: parseIndexedStrings(formData, 'extraHiddenHint'),
  }
}

export function parseWhiteScreenHintsFromForm(formData: FormData): WhiteScreenHint[] {
  const n = Number(formData.get('whiteScreen_count'))
  if (!Number.isFinite(n) || n < 0) return []
  const out: WhiteScreenHint[] = []
  for (let i = 0; i < n; i++) {
    const trigger = String(formData.get(`whiteScreen_${i}_trigger`) ?? '').trim()
    const popupText = String(formData.get(`whiteScreen_${i}_popupText`) ?? '').trim()
    if (!trigger) continue
    out.push({ trigger, popupText })
  }
  return out
}

export async function parseExtraMediaBlocksFromForm(
  formData: FormData,
): Promise<ExtraMediaBlock[]> {
  const n = Number(formData.get('extraMedia_count'))
  if (!Number.isFinite(n) || n < 0) return []
  const blocks: ExtraMediaBlock[] = []

  for (let i = 0; i < n; i++) {
    const mediaTypeRaw = (formData.get(`extraMedia_${i}_mediaType`) as string) || 'NONE'
    if (!['NONE', 'IMAGE', 'VIDEO', 'AUDIO'].includes(mediaTypeRaw)) continue
    const mediaType = mediaTypeRaw as MediaType

    const uploadedFile = formData.get(`extraMedia_${i}_mediaFile`)
    const rawUrl = ((formData.get(`extraMedia_${i}_mediaUrl`) as string) || '').trim()
    const persistRaw = (formData.get(`extraMedia_${i}_persistUrl`) as string) || ''
    const persistUrl = persistRaw.trim() === '' ? null : persistRaw.trim()

    let mediaUrl: string | null = null
    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      mediaUrl =
        mediaType === 'IMAGE'
          ? await saveEnigmaPhaseUpload(uploadedFile, 'IMAGE')
          : mediaType === 'AUDIO'
            ? await saveEnigmaPhaseUpload(uploadedFile, 'AUDIO')
            : null
    } else if (mediaType === 'VIDEO' && rawUrl) {
      mediaUrl = toYouTubeEmbedUrl(rawUrl)
    } else if (rawUrl) {
      mediaUrl = rawUrl
    } else {
      mediaUrl = persistUrl
    }

    const imageFile = ((formData.get(`extraMedia_${i}_imageFile`) as string) || '').trim() || null
    const imageAlt = ((formData.get(`extraMedia_${i}_imageAlt`) as string) || '').trim() || null

    blocks.push({
      mediaType,
      mediaUrl: mediaType === 'NONE' ? null : mediaUrl,
      imageFile: mediaType === 'IMAGE' ? imageFile : null,
      imageAlt: mediaType === 'IMAGE' ? imageAlt : null,
    })
  }

  return blocks.filter((b) => b.mediaType === 'NONE' || Boolean(b.mediaUrl))
}
