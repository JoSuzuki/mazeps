import { saveEnigmaCertificateJpeg } from '~/lib/upload'

export type ResolvedPhaseCertificate = {
  providesCertificate: boolean
  certificateTitle: string | null
  certificateImageUrl: string | null
}

export async function resolvePhaseCertificateFromForm(
  formData: FormData,
  existing: ResolvedPhaseCertificate,
): Promise<
  ({ ok: true } & ResolvedPhaseCertificate) | { ok: false; error: string }
> {
  const providesCertificate = formData.get('providesCertificate') === 'yes'
  const titleRaw = String(formData.get('certificateTitle') ?? '').trim()
  const file = formData.get('certificateImageFile')

  if (!providesCertificate) {
    return {
      ok: true,
      providesCertificate: false,
      certificateTitle: null,
      certificateImageUrl: null,
    }
  }

  if (!titleRaw) {
    return {
      ok: false,
      error:
        'Com certificado ativo, indique o nome do certificado (texto mostrado no perfil).',
    }
  }

  let certificateImageUrl = existing.certificateImageUrl
  if (file instanceof File && file.size > 0) {
    try {
      certificateImageUrl = await saveEnigmaCertificateJpeg(file, titleRaw)
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Falha ao enviar a imagem do certificado.'
      return { ok: false, error: msg }
    }
  }

  if (!certificateImageUrl) {
    return {
      ok: false,
      error: 'Envie uma imagem JPEG para o certificado.',
    }
  }

  return {
    ok: true,
    providesCertificate: true,
    certificateTitle: titleRaw,
    certificateImageUrl,
  }
}
