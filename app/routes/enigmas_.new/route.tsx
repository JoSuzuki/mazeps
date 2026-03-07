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
      <h1 className="flex justify-center text-lg">Criar enigma</h1>
      <Spacer size="md" />
      <Form method="post">
        <TextInput id="name" name="name" label="Nome" type="text" required={true} />
        <Spacer size="sm" />
        <TextInput
          id="slug"
          name="slug"
          label="Slug (usado na URL, ex: meu-enigma)"
          type="text"
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
    return data({ error: 'Apenas admins podem criar enigmas' })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const slug = (formData.get('slug') as string).toLowerCase().trim()

  const enigma = await context.prisma.enigma.create({ data: { name, slug } })

  return redirect(`/enigmas/${enigma.slug}/edit`)
}
