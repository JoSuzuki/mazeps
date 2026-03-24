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
