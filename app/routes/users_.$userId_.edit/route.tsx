import { data, Form, Link, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import RadioGroup from '~/components/radio-group/radio-group.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (
    context.currentUser.role !== Role.ADMIN &&
    context.currentUser.id !== Number(params.userId)
  )
    return redirect('/')

  const user = await context.prisma.user.findUniqueOrThrow({
    where: { id: Number(params.userId) },
  })

  return { user, currentUser: context.currentUser }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="flex justify-between px-6 py-2">
        <Link to={`/users/${loaderData.user.id}`}>← Voltar</Link>
      </div>
      <Center>
        <h1 className="flex justify-center text-lg">Editar usuário</h1>
        <Spacer size="md" />
        <Form method="post">
          <TextInput
            id="name"
            name="name"
            label="Nome"
            type="text"
            required={true}
            defaultValue={loaderData.user.name}
          />
          <Spacer size="sm" />
          <TextInput
            id="email"
            name="email"
            label="Email"
            type="email"
            required={true}
            defaultValue={loaderData.user.email}
          />
          <Spacer size="sm" />
          <TextInput
            id="nickname"
            name="nickname"
            label="Apelido"
            type="text"
            required={true}
            defaultValue={loaderData.user.nickname}
          />
          {loaderData.currentUser.role === Role.ADMIN && (
            <>
              <Spacer size="sm" />
              <RadioGroup
                label="Role"
                name="role"
                required={true}
                defaultValue={loaderData.user.role}
                options={Object.values(Role).map((role) => ({
                  id: role,
                  label: role,
                  value: role,
                }))}
              />
            </>
          )}
          <Spacer size="md" />
          <Button className="w-full" type="submit">
            Salvar
          </Button>
        </Form>
      </Center>
    </>
  )
}

export async function action({ context, request, params }: Route.ActionArgs) {
  if (!context.currentUser)
    return data({
      error: 'É necessário estar logado para atualizar seus dados',
    })

  const formData = await request.formData()

  const user = await context.prisma.user.update({
    where: {
      id: Number(params.userId),
    },
    data: {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      nickname: formData.get('nickname') as string,
      ...(context.currentUser.role === Role.ADMIN && {
        role: formData.get('role') as Role,
      }),
    },
  })

  return redirect(`/users/${user.id}`)
}
