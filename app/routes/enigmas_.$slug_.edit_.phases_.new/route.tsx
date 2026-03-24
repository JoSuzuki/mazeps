import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import EnigmaPhaseForm from '~/components/enigma-phase-form/enigma-phase-form.component'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import { saveUploadedFile } from '~/lib/upload'
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
  const hiddenHintRaw = (formData.get('hiddenHint') as string) ?? ''
  const hiddenHint = hiddenHintRaw.trim() === '' ? null : hiddenHintRaw.trim()

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
      tipPhrase,
      hiddenHint,
    },
  })

  return redirect(`/enigmas/${params.slug}/edit`)
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const nextOrder = loaderData.enigma._count.phases + 1

  return (
    <>
      <BackButtonPortal to={`/enigmas/${loaderData.enigma.slug}/edit`} />
      <Center>
        <div className="mx-auto max-w-2xl px-6 py-10">
          <header className="mb-8">
            <h1 className="font-brand flex items-center gap-2 text-2xl tracking-wide">
              <PlusIcon />
              Nova fase
            </h1>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-foreground/50">
              {loaderData.enigma.name}
            </p>
          </header>

          <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <Form method="post" encType="multipart/form-data">
              <EnigmaPhaseForm
                defaultValues={{ order: nextOrder }}
                submitLabel="Criar fase"
              />
            </Form>
          </section>
        </div>
      </Center>
    </>
  )
}
