import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { cookieUserFields, setSession } from '~/services/session'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  return {
    currentUser: context.currentUser,
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <BackButtonPortal to="/profile" />
      <Center>
        <h1 className="flex justify-center text-lg">Editar Profile</h1>
        <Spacer size="md" />
        <Form method="post">
          <TextInput
            id="name"
            name="name"
            label="Nome"
            type="text"
            required={true}
            defaultValue={loaderData.currentUser.name}
          />
          <Spacer size="sm" />
          <TextInput
            id="email"
            name="email"
            label="Email"
            type="email"
            required={true}
            defaultValue={loaderData.currentUser.email}
          />
          <Spacer size="sm" />
          <TextInput
            id="nickname"
            name="nickname"
            label="Apelido"
            type="text"
            required={true}
            defaultValue={loaderData.currentUser.nickname}
          />
          <Spacer size="md" />
          <Button className="w-full" type="submit">
            Salvar
          </Button>
        </Form>
      </Center>
    </>
  )
}

export async function action({ context, request }: Route.ActionArgs) {
  if (!context.currentUser)
    return data({
      error: 'É necessário estar logado para atualizar seus dados',
    })

  const formData = await request.formData()

  const currentUser = await context.prisma.user.update({
    where: {
      id: context.currentUser.id,
    },
    data: {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      nickname: formData.get('nickname') as string,
    },
    select: cookieUserFields,
  })

  return redirect('/profile', {
    headers: {
      'Set-Cookie': await setSession(request, currentUser),
    },
  })
}
