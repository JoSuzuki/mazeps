import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')
  return data(null)
}

export default function Route() {
  return (
    <Center>
      <h1>Criar evento</h1>
      <Spacer size="md" />
      <Form method="post">
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
  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const dateRaw = formData.get('date') as string

  const event = await context.prisma.event.create({
    data: {
      name,
      description,
      date: dateRaw ? new Date(dateRaw) : null,
    },
  })

  return redirect(`/events/${event.id}`)
}
