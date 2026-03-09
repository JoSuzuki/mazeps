import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { Role } from '~/generated/prisma/enums'
import { saveUploadedFile } from '~/lib/upload'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: Number(params.eventId) },
  })

  return { event }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const { event } = loaderData

  return (
    <>
      <div className="px-6 py-2">
        <Link to={`/events/${params.eventId}`} viewTransition>
          ← Voltar
        </Link>
      </div>
      <Center>
        <h1>Editar evento</h1>
        <Spacer size="md" />
        <Form method="post" encType="multipart/form-data">
          <TextInput
            id="name"
            name="name"
            label="Nome"
            type="text"
            required={true}
            defaultValue={event.name}
          />
          <Spacer size="md" />
          <label className="block" htmlFor="description">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            className="w-full rounded-md border-1 p-1"
            rows={4}
            defaultValue={event.description ?? ''}
          />
          <Spacer size="md" />
          <TextInput
            id="date"
            name="date"
            label="Data"
            type="date"
            required={false}
            defaultValue={
              event.date ? new Date(event.date).toISOString().slice(0, 10) : ''
            }
          />
          <Spacer size="md" />
          <label className="block" htmlFor="badgeFile">
            Badge (imagem)
          </label>
          {event.badgeFile && (
            <div className="mb-2">
              <p className="text-sm opacity-60">Badge atual:</p>
              <img
                src={event.badgeFile}
                alt="Badge atual"
                className="h-12 w-12 object-contain"
              />
            </div>
          )}
          <input
            id="badgeFile"
            name="badgeFile"
            type="file"
            accept="image/*"
            className="w-full"
          />
          <Spacer size="md" />
          <Button type="submit">Salvar</Button>
        </Form>
      </Center>
    </>
  )
}

export async function action({ request, context, params }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Apenas admins podem editar eventos' })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const dateRaw = formData.get('date') as string

  const existing = await context.prisma.event.findUniqueOrThrow({
    where: { id: Number(params.eventId) },
    select: { badgeFile: true },
  })

  let badgeFile = existing.badgeFile
  const uploadedBadge = formData.get('badgeFile')
  if (uploadedBadge instanceof File && uploadedBadge.size > 0) {
    badgeFile = await saveUploadedFile(uploadedBadge, 'badges')
  }

  await context.prisma.event.update({
    where: { id: Number(params.eventId) },
    data: {
      name,
      description,
      date: dateRaw ? new Date(dateRaw) : null,
      badgeFile,
    },
  })

  return redirect(`/events/${params.eventId}`)
}
