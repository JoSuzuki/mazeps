import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import crypto from 'node:crypto'
import { normalizeImgurBadgeUrl } from '~/lib/imgur-badge-url'

export { isEnigmaServerUploadUrl } from '~/lib/enigma-upload-url'

const ENIGMA_MEDIA_MAX_BYTES = 12 * 1024 * 1024

const IMAGE_EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

const AUDIO_EXT_BY_MIME: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
}

const ALLOWED_IMAGE_MIMES = Object.keys(IMAGE_EXT_BY_MIME)
const ALLOWED_AUDIO_MIMES = Object.keys(AUDIO_EXT_BY_MIME)

/**
 * Upload para fases de enigma: valida tipo e tamanho, grava em /uploads/enigmas/ com nome único.
 * A URL retornada é servida por express.static e fica persistida em `EnigmaPhase.mediaUrl`.
 */
/** Nome sugerido ao abrir/guardar ficheiro (aba do browser, “Guardar como”). */
export function sanitizeEnigmaDownloadFilename(originalName: string): string {
  const base = originalName.replace(/^.*[/\\]/, '').trim() || 'ficheiro'
  return base.slice(0, 240)
}

export async function saveEnigmaPhaseUpload(
  file: File,
  kind: 'IMAGE' | 'AUDIO',
): Promise<string> {
  if (file.size > ENIGMA_MEDIA_MAX_BYTES) {
    throw new Error('Arquivo muito grande (máximo 12 MB).')
  }

  const mime = (file.type || '').toLowerCase().split(';')[0].trim()
  const map = kind === 'IMAGE' ? IMAGE_EXT_BY_MIME : AUDIO_EXT_BY_MIME
  const allowed = kind === 'IMAGE' ? ALLOWED_IMAGE_MIMES : ALLOWED_AUDIO_MIMES

  if (!mime || !allowed.includes(mime)) {
    throw new Error(
      kind === 'IMAGE'
        ? 'Formato de imagem não aceito. Use JPEG, PNG, GIF, WebP, AVIF ou SVG.'
        : 'Formato de áudio não aceito. Use MP3, WAV, OGG ou WebM.',
    )
  }

  const ext = map[mime] ?? 'bin'
  const uploadDir = join(process.cwd(), 'uploads', 'enigmas')
  await mkdir(uploadDir, { recursive: true })

  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  const downloadLabel = sanitizeEnigmaDownloadFilename(file.name)
  await writeFile(join(uploadDir, `${filename}.download-name`), downloadLabel, 'utf8')

  return `/uploads/enigmas/${filename}`
}

export async function saveUploadedFile(
  file: File,
  folder: string = 'enigmas',
): Promise<string> {
  const uploadDir = join(process.cwd(), 'uploads', folder)
  await mkdir(uploadDir, { recursive: true })

  const ext = file.name.split('.').pop() ?? ''
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  return `/uploads/${folder}/${filename}`
}

export type ResolveEventBadgeFileResult =
  | { ok: true; badgeFile: string | null }
  | { ok: false; error: string }

/**
 * Resolve badge a partir do formulário.
 * Prioridade: 1) URL Imgur (https + domínio imgur) 2) radios / preservar em edição.
 * Badge personalizada no servidor não é guardada em disco (use Imgur).
 */
export async function resolveEventBadgeFile(
  formData: FormData,
  options: { previousBadgeFile?: string | null } = {},
): Promise<ResolveEventBadgeFileResult> {
  const badgeUpload = formData.get('badgeUpload')
  if (badgeUpload instanceof File && badgeUpload.size > 0) {
    return {
      ok: false,
      error:
        'O envio de ficheiro para a badge não está disponível. Carregue a imagem no Imgur e cole o link https (ex.: https://i.imgur.com/….png).',
    }
  }

  const imgurRaw = String(formData.get('badgeImgurUrl') ?? '').trim()
  if (imgurRaw !== '') {
    const url = normalizeImgurBadgeUrl(imgurRaw)
    if (!url) {
      return {
        ok: false,
        error:
          'Link do Imgur inválido. Use um endereço https (ex.: https://i.imgur.com/….png ou .jpg).',
      }
    }
    return { ok: true, badgeFile: url }
  }

  const badgeFileField = formData.get('badgeFile')
  if (badgeFileField === null) {
    return {
      ok: true,
      badgeFile:
        options.previousBadgeFile !== undefined
          ? options.previousBadgeFile ?? null
          : null,
    }
  }

  const s = String(badgeFileField).trim()
  return { ok: true, badgeFile: s === '' ? null : s }
}
