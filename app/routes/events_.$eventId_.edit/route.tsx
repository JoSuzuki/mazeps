import { useState } from 'react'
import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { Role } from '~/generated/prisma/enums'
import { AVAILABLE_BADGES } from '~/lib/badges'

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
  const [selectedBadge, setSelectedBadge] = useState<string | null>(
    event.badgeFile,
  )

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
        <Form method="post">
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
          <label className="block">Badge</label>
          <Spacer size="sm" />
          <div className="flex flex-wrap gap-3">
            <label
              className={`cursor-pointer rounded-md border-2 p-1 transition-colors ${
                selectedBadge === null ? 'border-black' : 'border-transparent'
              }`}
            >
              <input
                type="radio"
                name="badgeFile"
                value=""
                className="sr-only"
                onChange={() => setSelectedBadge(null)}
                defaultChecked={!event.badgeFile}
              />
              <div className="flex h-16 w-16 items-center justify-center text-xs opacity-40">
                Nenhum
              </div>
            </label>
            {AVAILABLE_BADGES.map((badge) => (
              <label
                key={badge.path}
                className={`cursor-pointer rounded-md border-2 p-1 transition-colors ${
                  selectedBadge === badge.path
                    ? 'border-black'
                    : 'border-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="badgeFile"
                  value={badge.path}
                  className="sr-only"
                  onChange={() => setSelectedBadge(badge.path)}
                  defaultChecked={event.badgeFile === badge.path}
                />
                <img
                  src={badge.path}
                  alt={badge.label}
                  title={badge.label}
                  className="h-16 w-16 object-contain"
                />
              </label>
            ))}
          </div>
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
  const badgeFile = (formData.get('badgeFile') as string) || null

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
