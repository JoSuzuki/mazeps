import { data, Form, redirect, useNavigation } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import EnigmaPhaseEditorErrorBanner from '~/components/enigma-phase-editor-error-banner/enigma-phase-editor-error-banner.component'
import EnigmaPhaseForm from '~/components/enigma-phase-form/enigma-phase-form.component'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import { saveEnigmaPhaseUpload } from '~/lib/upload'
import {
  parseExtraMediaBlocksFromForm,
  parsePhaseTextExtrasFromForm,
  parseWhiteScreenHintsFromForm,
} from '~/lib/enigma-phase-form-parse.server'
import {
  ENIGMA_PHASE_DUPLICATE_ANSWER_ERROR,
  phaseAnswerConflictsWithSiblingPhases,
} from '~/lib/enigma-phase-answer.server'
import { resolvePhaseCertificateFromForm } from '~/lib/enigma-phase-certificate.server'
import { allocateUniquePlayPathToken } from '~/lib/enigma-play-path-token.server'
import { toYouTubeEmbedUrl } from '~/lib/youtube'
import { Role } from '~/generated/prisma/enums'

const ICON_CLASS = 'h-5 w-5 shrink-0 text-foreground/50'

function PlusIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const enigma = await context.prisma.enigma.findUniqueOrThrow({
    where: { slug: params.slug },
    include: { _count: { select: { phases: true } } },
  })

  return { enigma }
}

export function meta({ data }: Route.MetaArgs) {
  const robots = enigmaRobotsMeta()
  if (!data?.enigma) return [...robots, { title: 'Nova fase | Mazeps' }]
  return [...robots, { title: `Nova fase — ${data.enigma.name} | Mazeps` }]
}

export async function action({ request, context, params }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Não autorizado' })
  }

  const enigma = await context.prisma.enigma.findUniqueOrThrow({
    where: { slug: params.slug },
  })

  const formData = await request.formData()
  const order = Number(formData.get('order'))
  const title = formData.get('title') as string
  const pageTitle = (formData.get('pageTitle') as string) || null
  const mediaType = formData.get('mediaType') as string
  const uploadedFile = formData.get('mediaFile')
  const rawMediaUrl = (formData.get('mediaUrl') as string) || null
  let mediaUrl: string | null = null
  try {
    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      if (mediaType === 'IMAGE') {
        mediaUrl = await saveEnigmaPhaseUpload(uploadedFile, 'IMAGE')
      } else if (mediaType === 'AUDIO') {
        mediaUrl = await saveEnigmaPhaseUpload(uploadedFile, 'AUDIO')
      }
    } else if (mediaType === 'VIDEO' && rawMediaUrl?.trim()) {
      mediaUrl = toYouTubeEmbedUrl(rawMediaUrl.trim())
    } else if (rawMediaUrl?.trim()) {
      mediaUrl = rawMediaUrl.trim()
    } else {
      mediaUrl = null
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao enviar o arquivo de mídia.'
    return data({ error: msg }, { status: 400 })
  }

  if (mediaType !== 'NONE' && !mediaUrl) {
    return data(
      {
        error:
          'Para este tipo de mídia, envie um arquivo (imagem/áudio) ou informe uma URL válida (imagem, áudio ou YouTube).',
      },
      { status: 400 },
    )
  }

  const imageFile = (formData.get('imageFile') as string) || null
  const imageAlt = (formData.get('imageAlt') as string) || null
  const phrase = formData.get('phrase') as string
  const answer = formData.get('answer') as string
  const siblingPhases = await context.prisma.enigmaPhase.findMany({
    where: { enigmaId: enigma.id },
    select: { id: true, answer: true },
  })
  if (phaseAnswerConflictsWithSiblingPhases(siblingPhases, answer)) {
    return data({ error: ENIGMA_PHASE_DUPLICATE_ANSWER_ERROR }, { status: 400 })
  }
  const tipPhrase = (formData.get('tipPhrase') as string) || null
  const hiddenHintRaw = (formData.get('hiddenHint') as string) ?? ''
  const hiddenHint = hiddenHintRaw.trim() === '' ? null : hiddenHintRaw.trim()

  const textExtras = parsePhaseTextExtrasFromForm(formData)
  const whiteScreenHints = parseWhiteScreenHintsFromForm(formData)

  let extraMediaBlocks
  try {
    extraMediaBlocks = await parseExtraMediaBlocksFromForm(formData)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao processar mídias adicionais.'
    return data({ error: msg }, { status: 400 })
  }

  const resolvedCert = await resolvePhaseCertificateFromForm(formData, {
    providesCertificate: false,
    certificateTitle: null,
    certificateImageUrl: null,
  })
  if (!resolvedCert.ok) {
    return data({ error: resolvedCert.error }, { status: 400 })
  }

  const playPathToken = await allocateUniquePlayPathToken(
    context.prisma,
    enigma.id,
  )

  await context.prisma.enigmaPhase.create({
    data: {
      enigmaId: enigma.id,
      order,
      title,
      pageTitle,
      mediaType: mediaType as any,
      mediaUrl,
      imageFile,
      imageAlt,
      phrase,
      answer,
      playPathToken,
      tipPhrase,
      hiddenHint,
      extraMediaBlocks,
      extraPhrases: textExtras.extraPhrases,
      extraTipPhrases: textExtras.extraTipPhrases,
      extraHiddenHints: textExtras.extraHiddenHints,
      whiteScreenHints,
      providesCertificate: resolvedCert.providesCertificate,
      certificateTitle: resolvedCert.certificateTitle,
      certificateImageUrl: resolvedCert.certificateImageUrl,
    },
  })

  return redirect(`/enigmas/${params.slug}/edit`)
}

export default function Route({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const formBusy = navigation.state === 'submitting'
  const nextOrder = loaderData.enigma._count.phases + 1

  return (
    <>
      <BackButtonPortal to={`/enigmas/${loaderData.enigma.slug}/edit`} />
      <Center>
        <div className="mx-auto max-w-2xl px-6 py-10">
          <EnigmaPhaseEditorErrorBanner
            message={
              actionData && 'error' in actionData && actionData.error
                ? actionData.error
                : undefined
            }
          />
          <header className="mb-8">
            <h1 className="font-brand flex items-center gap-2 text-2xl tracking-wide">
              <PlusIcon />
              Nova fase
            </h1>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-foreground/50">
              {loaderData.enigma.name}
            </p>
          </header>

          <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <Form method="post" encType="multipart/form-data">
              <EnigmaPhaseForm
                defaultValues={{ order: nextOrder }}
                submitLabel="Criar fase"
                submitDisabled={formBusy}
              />
            </Form>
          </section>
        </div>
      </Center>
    </>
  )
}
