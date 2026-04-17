import type { PrismaClient } from '~/generated/prisma/client'
import { PrismaClientKnownRequestError } from '~/generated/prisma/internal/prismaNamespace'
import type { CurrentUser } from '~/services/session'

type PhaseCertFields = {
  id: number
  providesCertificate: boolean
  certificateTitle: string | null
  certificateImageUrl: string | null
}

/**
 * Na primeira resposta certa, com sessão e fase configurada com certificado + JPEG.
 * Usado tanto em `/enigmas/:slug` (primeira fase) como em `/enigmas/:slug/:phaseKey`.
 */
export async function grantEnigmaPhaseCertificateIfEligible(
  prisma: PrismaClient,
  currentUser: CurrentUser | undefined,
  phaseFull: PhaseCertFields,
): Promise<void> {
  const certTitle = phaseFull.certificateTitle?.trim()
  const certUrl = phaseFull.certificateImageUrl?.trim()
  if (
    !currentUser ||
    phaseFull.providesCertificate !== true ||
    !certTitle ||
    !certUrl
  ) {
    return
  }
  try {
    await prisma.enigmaPhaseCertificateAward.create({
      data: {
        userId: currentUser.id,
        enigmaPhaseId: phaseFull.id,
        awardTitle: certTitle,
        awardImageUrl: certUrl,
      },
    })
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
      return
    }
    throw e
  }
}
