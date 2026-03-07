import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import EnigmaPhaseForm from '~/components/enigma-phase-form/enigma-phase-form.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import { saveUploadedFile } from '~/lib/upload'
import { toYouTubeEmbedUrl } from '~/lib/youtube'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const phase = await context.prisma.enigmaPhase.findUniqueOrThrow({
    where: { id: Number(params.phaseId) },
    include: { enigma: true },
  })

  return { phase }
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
  const mediaType = formData.get('mediaType') as string
  const uploadedFile = formData.get('mediaFile')
  const rawMediaUrl = (formData.get('mediaUrl') as string) || null

  const existingPhase = await context.prisma.enigmaPhase.findUniqueOrThrow({
    where: { id: Number(params.phaseId) },
  })

  let mediaUrl: string | null = null
  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    mediaUrl = await saveUploadedFile(uploadedFile)
  } else if (mediaType === 'VIDEO' && rawMediaUrl) {
    mediaUrl = toYouTubeEmbedUrl(rawMediaUrl)
  } else if (rawMediaUrl) {
    mediaUrl = rawMediaUrl
  } else {
    // No new file or URL provided — keep existing
    mediaUrl = existingPhase.mediaUrl
  }
  const imageFile = (formData.get('imageFile') as string) || null
  const imageAlt = (formData.get('imageAlt') as string) || null
  const phrase = formData.get('phrase') as string
  const answer = formData.get('answer') as string
  const tipPhrase = (formData.get('tipPhrase') as string) || null

  const phase = await context.prisma.enigmaPhase.update({
    where: { id: Number(params.phaseId) },
    data: {
      order,
      title,
      mediaType: mediaType as any,
      mediaUrl,
      imageFile,
      imageAlt,
      phrase,
      answer,
      tipPhrase,
    },
    include: { enigma: true },
  })

  return redirect(`/enigmas/${phase.enigma.slug}/edit`)
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const { phase } = loaderData

  return (
    <>
      <div className="px-6 py-2">
        <Link to={`/enigmas/${phase.enigma.slug}/edit`} viewTransition>
          ← Voltar
        </Link>
      </div>
      <Center>
        <h1 className="flex justify-center text-lg">
          Editar fase {phase.order} — {phase.enigma.name}
        </h1>
        <Spacer size="md" />
        <Form method="post" encType="multipart/form-data">
          <input type="hidden" name="intent" value="update" />
          <EnigmaPhaseForm
            defaultValues={{
              order: phase.order,
              title: phase.title,
              mediaType: phase.mediaType,
              mediaUrl: phase.mediaUrl,
              imageFile: phase.imageFile,
              imageAlt: phase.imageAlt,
              phrase: phase.phrase,
              answer: phase.answer,
              tipPhrase: phase.tipPhrase,
            }}
            submitLabel="Salvar"
          />
        </Form>
        <Spacer size="lg" />
        <Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <button
            type="submit"
            className="cursor-pointer text-red-500 hover:underline"
            onClick={(e) => {
              if (!confirm('Remover esta fase permanentemente?')) e.preventDefault()
            }}
          >
            Remover fase
          </button>
        </Form>
      </Center>
    </>
  )
}
