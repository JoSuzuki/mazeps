import type { PrismaClient } from '~/generated/prisma/client'

/** Metadados do enigma + fases leves (id, ordem, resposta) para encadear URLs e janela pública. */
export async function loadEnigmaLightForPlay(
  prisma: PrismaClient,
  slug: string,
) {
  return prisma.enigma.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      published: true,
      publicPhaseOrderFrom: true,
      publicPhaseOrderTo: true,
      entrancePasswordHash: true,
      entrancePasswordPrompt: true,
      parabensScreenBody: true,
      interludeScreenBody: true,
      phases: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          answer: true,
          playPathToken: true,
        },
      },
    },
  })
}

const phasePlayPayloadSelect = {
  id: true,
  enigmaId: true,
  order: true,
  title: true,
  pageTitle: true,
  phrase: true,
  mediaType: true,
  mediaUrl: true,
  imageAlt: true,
  tipPhrase: true,
  hiddenHint: true,
  extraMediaBlocks: true,
  extraPhrases: true,
  extraTipPhrases: true,
  extraHiddenHints: true,
  whiteScreenHints: true,
  answer: true,
  providesCertificate: true,
  certificateTitle: true,
  certificateImageUrl: true,
} as const

export type EnigmaPhasePlayPayload = NonNullable<
  Awaited<ReturnType<typeof loadEnigmaPhasePlayPayload>>
>

export async function loadEnigmaPhasePlayPayload(
  prisma: PrismaClient,
  phaseId: number,
) {
  return prisma.enigmaPhase.findUnique({
    where: { id: phaseId },
    select: phasePlayPayloadSelect,
  })
}
