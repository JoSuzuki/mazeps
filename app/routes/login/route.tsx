import { Form, data, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import GoogleLoginButton from '~/components/google-login-button/google-login-button.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { authenticator, setSession } from '~/services/session'

export async function loader({ context }: Route.LoaderArgs) {
  if (context.currentUser) return redirect('/')

  return data(null)
}

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: 'Mazeps - Login' }]
}

export default function Route({ actionData }: Route.ComponentProps) {
  return (
    <Center>
      <Link to="/" className="absolute top-2 left-2">
        ← Voltar
      </Link>
      <h1 className="flex justify-center text-lg">Login</h1>

      <Form method="post">
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
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link className="text-xs" to="/forgot-password">
            Esqueceu a senha?
          </Link>
        </div>

        {actionData?.error ? (
          <>
            <Spacer size="sm" />
            <div className="text-error">{actionData.error}</div>
          </>
        ) : null}
        <Spacer size="md" />
        <Button className="w-full" type="submit">
          Login
        </Button>
      </Form>
      <Spacer size="sm" />
      <GoogleLoginButton />
      <Spacer size="sm" />
      <LinkButton to="/sign-up" styleType="secondary" className="w-full">
        Cadastre-se
      </LinkButton>
    </Center>
  )
}

export async function action({ request }: Route.ActionArgs) {
  try {
    let user = await authenticator.authenticate('email-password', request)

    return redirect('/', {
      headers: {
        'Set-Cookie': await setSession(request, user),
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      return data({ error: error.message })
    }

    throw error
  }
}
