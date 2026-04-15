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
import { toYouTubeEmbedUrl } from '~/lib/youtube'
import { Role } from '~/generated/prisma/enums'

const ICON_CLASS = 'h-5 w-5 shrink-0 text-foreground/50'

function PencilIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const phase = await context.prisma.enigmaPhase.findUniqueOrThrow({
    where: { id: Number(params.phaseId) },
    include: { enigma: true },
  })

  return { phase }
}

export function meta({ data }: Route.MetaArgs) {
  const robots = enigmaRobotsMeta()
  if (!data?.phase) return [...robots, { title: 'Editar fase | Mazeps' }]
  return [
    ...robots,
    {
      title: `Editar fase — ${data.phase.enigma.name} | Mazeps`,
    },
  ]
}

export async function action({ request, context, params }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Não autorizado' })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string

  if (intent === 'delete') {
    const phase = await context.prisma.enigmaPhase.findUniqueOrThrow({
      where: { id: Number(params.phaseId) },
      include: { enigma: true },
    })
    await context.prisma.enigmaPhase.delete({ where: { id: Number(params.phaseId) } })
    return redirect(`/enigmas/${phase.enigma.slug}/edit`)
  }

  const order = Number(formData.get('order'))
  const title = formData.get('title') as string
  const pageTitle = (formData.get('pageTitle') as string) || null
  const mediaType = formData.get('mediaType') as string
  const uploadedFile = formData.get('mediaFile')
  const rawMediaUrl = (formData.get('mediaUrl') as string) || null

  const existingPhase = await context.prisma.enigmaPhase.findUniqueOrThrow({
    where: { id: Number(params.phaseId) },
  })

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
      mediaUrl = existingPhase.mediaUrl
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
  const tipPhrase = (formData.get('tipPhrase') as string) || null
  const hiddenHintRaw = (formData.get('hiddenHint') as string) ?? ''
  const hiddenHint = hiddenHintRaw.trim() === '' ? null : hiddenHintRaw.trim()

  const siblingPhases = await context.prisma.enigmaPhase.findMany({
    where: { enigmaId: existingPhase.enigmaId },
    select: { id: true, answer: true },
  })
  if (
    phaseAnswerConflictsWithSiblingPhases(
      siblingPhases,
      answer,
      existingPhase.id,
    )
  ) {
    return data({ error: ENIGMA_PHASE_DUPLICATE_ANSWER_ERROR }, { status: 400 })
  }

  const textExtras = parsePhaseTextExtrasFromForm(formData)
  const whiteScreenHints = parseWhiteScreenHintsFromForm(formData)

  let extraMediaBlocks
  try {
    extraMediaBlocks = await parseExtraMediaBlocksFromForm(formData)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao processar mídias adicionais.'
    return data({ error: msg }, { status: 400 })
  }

  const phase = await context.prisma.enigmaPhase.update({
    where: { id: Number(params.phaseId) },
    data: {
      order,
      title,
      pageTitle,
      mediaType: mediaType as any,
      mediaUrl,
      imageFile,
      imageAlt,
      phrase,
      answer,
      tipPhrase,
      hiddenHint,
      extraMediaBlocks,
      extraPhrases: textExtras.extraPhrases,
      extraTipPhrases: textExtras.extraTipPhrases,
      extraHiddenHints: textExtras.extraHiddenHints,
      whiteScreenHints,
    },
    include: { enigma: true },
  })

  return redirect(`/enigmas/${phase.enigma.slug}/edit`)
}

export default function Route({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const formBusy = navigation.state === 'submitting'
  const { phase } = loaderData

  return (
    <>
      <BackButtonPortal to={`/enigmas/${phase.enigma.slug}/edit`} />
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
              <PencilIcon />
              Editar fase {phase.order}
            </h1>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-foreground/50">
              {phase.enigma.name}
            </p>
          </header>

          <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <Form method="post" encType="multipart/form-data">
              <input type="hidden" name="intent" value="update" />
              <EnigmaPhaseForm
                prominentAnswerSection
                defaultValues={{
                  order: phase.order,
                  title: phase.title,
                  pageTitle: phase.pageTitle,
                  mediaType: phase.mediaType,
                  mediaUrl: phase.mediaUrl,
                  imageFile: phase.imageFile,
                  imageAlt: phase.imageAlt,
                  phrase: phase.phrase,
                  answer: phase.answer,
                  tipPhrase: phase.tipPhrase,
                  hiddenHint: phase.hiddenHint,
                  extraMediaBlocks: phase.extraMediaBlocks,
                  extraPhrases: phase.extraPhrases,
                  extraTipPhrases: phase.extraTipPhrases,
                  extraHiddenHints: phase.extraHiddenHints,
                  whiteScreenHints: phase.whiteScreenHints,
                }}
                submitLabel="Salvar alterações"
                submitDisabled={formBusy}
              />
            </Form>
          </section>

          <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-red-400">
              Zona de perigo
            </h2>
            <p className="mb-4 text-sm text-red-600 dark:text-red-300">
              Remover esta fase é irreversível.
            </p>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                disabled={formBusy}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-red-700 dark:hover:bg-red-800"
                onClick={(e) => {
                  if (!confirm('Remover esta fase permanentemente?')) e.preventDefault()
                }}
              >
                <TrashIcon />
                Remover fase
              </button>
            </Form>
          </section>
        </div>
      </Center>
    </>
  )
}
