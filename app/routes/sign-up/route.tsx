import bcrypt from 'bcrypt'
import { Form, data, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import GoogleLoginButton from '~/components/google-login-button/google-login-button.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { PrismaClientKnownRequestError } from '~/generated/prisma/internal/prismaNamespace'
import { setSession } from '~/services/session'

export async function loader({ context }: Route.LoaderArgs) {
  if (context.currentUser) return redirect('/')

  return data(null)
}

export default function Route({ actionData }: Route.ComponentProps) {
  return (
    <Center>
      <Link to="/login" className="absolute top-2 left-2">
        ← Voltar
      </Link>
      <h1 className="flex justify-center text-lg">Cadastrar</h1>
      <Form method="post">
        <TextInput
          id="name"
          name="name"
          type="text"
          required={true}
          label="Nome"
        />
        <Spacer size="sm" />
        <TextInput
          id="nickname"
          name="nickname"
          type="text"
          required={true}
          label="Apelido"
        />
        <Spacer size="sm" />
        <TextInput
          id="email"
          name="email"
          label="Email"
          type="email"
          required={true}
        />
        <Spacer size="sm" />
        <TextInput
          id="password"
          name="password"
          label="Senha"
          type="password"
          required={true}
        />
        <Spacer size="md" />
        {actionData?.error ? (
          <>
            <div className="text-error">{actionData.error}</div>
            <Spacer size="sm" />
          </>
        ) : null}
        <Button className="w-full" type="submit">
          Cadastrar
        </Button>
      </Form>
      <Spacer size="sm" />
      <GoogleLoginButton />
    </Center>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const nickname = formData.get('nickname') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await context.prisma.user.create({
      data: {
        name,
        nickname,
        email,
        password: hashedPassword,
      },
    })

    return redirect('/', {
      headers: {
        'Set-Cookie': await setSession(request, user),
      },
    })
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return data({ error: 'Email já está em uso' })
    }

    if (error instanceof Error) {
      return data({ error: error.message })
    }

    throw error
  }
}
