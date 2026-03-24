import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import crypto from 'node:crypto'
import { normalizeImgurBadgeUrl } from '~/lib/imgur-badge-url'

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
 * Resolve badge a partir do formulário (multipart).
 * Prioridade: 1) upload 2) URL Imgur (https + domínio imgur) 3) radios / preservar em edição.
 */
export async function resolveEventBadgeFile(
  formData: FormData,
  options: { previousBadgeFile?: string | null } = {},
): Promise<ResolveEventBadgeFileResult> {
  const badgeUpload = formData.get('badgeUpload')
  if (badgeUpload instanceof File && badgeUpload.size > 0) {
    const path = await saveUploadedFile(badgeUpload, 'badges')
    return { ok: true, badgeFile: path }
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
