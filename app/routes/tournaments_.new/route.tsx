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

export default function Route({}: Route.ComponentProps) {
  return (
    <Center>
      <h1>Criar torneio</h1>
      <Form method="post">
        <TextInput
          id="name"
          name="name"
          label="Nome"
          type="text"
          required={true}
        />
        <Spacer size="md" />
        <TextInput
          id="desiredTableSize"
          name="desiredTableSize"
          label="Tamanho da mesa"
          type="number"
          required={true}
        />
        <Spacer size="md" />
        <Button type="submit">Criar</Button>
      </Form>
    </Center>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Apenas admins podem criar torneios' })
  }
  const formData = await request.formData()
  const name = formData.get('name') as string
  const desiredTableSize = formData.get('desiredTableSize') as string

  const tournament = await context.prisma.tournament.create({
    data: {
      name: name,
      desiredTableSize: Number(desiredTableSize),
    },
  })

  return redirect(`/tournaments/${tournament.id}`)
}
