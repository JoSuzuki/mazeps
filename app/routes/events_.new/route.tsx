import { useState } from 'react'
import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { EventType, Role } from '~/generated/prisma/enums'
import { saveUploadedFile } from '~/lib/upload'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')
  return data(null)
}

export default function Route() {
  const [type, setType] = useState<EventType>(EventType.GENERAL)

  return (
    <Center>
      <h1>Criar evento</h1>
      <Spacer size="md" />
      <Form method="post" encType="multipart/form-data">
        <fieldset>
          <legend>Tipo</legend>
          <div>
            <input
              type="radio"
              id="type-general"
              name="type"
              value={EventType.GENERAL}
              defaultChecked
              onChange={() => setType(EventType.GENERAL)}
            />
            <label htmlFor="type-general"> Evento</label>
          </div>
          <div>
            <input
              type="radio"
              id="type-tournament"
              name="type"
              value={EventType.TOURNAMENT}
              onChange={() => setType(EventType.TOURNAMENT)}
            />
            <label htmlFor="type-tournament"> Torneio</label>
          </div>
        </fieldset>
        <Spacer size="md" />
        <TextInput
          id="name"
          name="name"
          label="Nome"
          type="text"
          required={true}
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
        />
        <Spacer size="md" />
        <TextInput
          id="date"
          name="date"
          label="Data"
          type="date"
          required={false}
        />
        <Spacer size="md" />
        <label className="block" htmlFor="badgeFile">
          Badge (imagem)
        </label>
        <input
          id="badgeFile"
          name="badgeFile"
          type="file"
          accept="image/*"
          className="w-full"
        />

        {type === EventType.TOURNAMENT && (
          <>
            <Spacer size="md" />
            <TextInput
              id="desiredTableSize"
              name="desiredTableSize"
              label="Tamanho da mesa"
              type="number"
              required={true}
            />
          </>
        )}

        <Spacer size="md" />
        <Button type="submit">Criar</Button>
      </Form>
    </Center>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Apenas admins podem criar eventos' })
  }

  const formData = await request.formData()
  const type = formData.get('type') as EventType
  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const dateRaw = formData.get('date') as string

  let badgeFile: string | null = null
  const uploadedBadge = formData.get('badgeFile')
  if (uploadedBadge instanceof File && uploadedBadge.size > 0) {
    badgeFile = await saveUploadedFile(uploadedBadge, 'badges')
  }

  const eventData = {
    name,
    description,
    date: dateRaw ? new Date(dateRaw) : null,
    badgeFile,
    type,
  }

  if (type === EventType.TOURNAMENT) {
    const desiredTableSize = Number(formData.get('desiredTableSize'))
    const tournament = await context.prisma.tournament.create({
      data: {
        name,
        desiredTableSize,
        event: { create: eventData },
      },
    })
    return redirect(`/tournaments/${tournament.id}`)
  }

  const event = await context.prisma.event.create({ data: eventData })
  return redirect(`/events/${event.id}`)
}
