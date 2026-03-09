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

  const enigma = await context.prisma.enigma.findUniqueOrThrow({
    where: { slug: params.slug },
    include: { _count: { select: { phases: true } } },
  })

  return { enigma }
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
  const mediaType = formData.get('mediaType') as string
  const uploadedFile = formData.get('mediaFile')
  const rawMediaUrl = (formData.get('mediaUrl') as string) || null
  let mediaUrl: string | null = null
  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    mediaUrl = await saveUploadedFile(uploadedFile)
  } else if (mediaType === 'VIDEO' && rawMediaUrl) {
    mediaUrl = toYouTubeEmbedUrl(rawMediaUrl)
  } else {
    mediaUrl = rawMediaUrl
  }
  const imageFile = (formData.get('imageFile') as string) || null
  const imageAlt = (formData.get('imageAlt') as string) || null
  const phrase = formData.get('phrase') as string
  const answer = formData.get('answer') as string
  const tipPhrase = (formData.get('tipPhrase') as string) || null

  await context.prisma.enigmaPhase.create({
    data: {
      enigmaId: enigma.id,
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
  })

  return redirect(`/enigmas/${params.slug}/edit`)
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const nextOrder = loaderData.enigma._count.phases + 1

  return (
    <>
      <div className="px-6 py-2">
        <Link to={`/enigmas/${loaderData.enigma.slug}/edit`} viewTransition>
          ← Voltar
        </Link>
      </div>
      <Center>
        <h1 className="flex justify-center text-lg">
          Nova fase — {loaderData.enigma.name}
        </h1>
        <Spacer size="md" />
        <Form method="post" encType="multipart/form-data">
          <EnigmaPhaseForm
            defaultValues={{ order: nextOrder }}
            submitLabel="Criar fase"
          />
        </Form>
      </Center>
    </>
  )
}
