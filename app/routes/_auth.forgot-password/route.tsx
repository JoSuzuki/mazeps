import crypto from 'crypto'
import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'
import { sendPasswordResetEmail } from '~/services/email'

export async function loader({ context, request }: Route.LoaderArgs) {
  if (context.currentUser) return redirect('/')

  const url = new URL(request.url)
  const expired = url.searchParams.get('expired') === '1'

  return data({ expired })
}

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: 'Mazeps - Esqueci minha senha' }]
}

function getAppUrl(request: Request): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
  return process.env.APP_URL ?? `${proto}://${host}`
}

export default function Route({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <>
      <BackButtonPortal to="/login" />
      <Center className="align-center grid place-content-center text-lg">
        <h1 className="font-brand text-center text-3xl tracking-wide">
          Esqueci minha senha
        </h1>
        <p className="mt-2 text-center text-base text-foreground/60">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
        <Spacer size="md" />
        {loaderData?.expired ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-700">
            O link de redefinição expirou. Solicite um novo abaixo.
          </div>
        ) : null}
        <div className="mx-auto w-full max-w-sm">
        <Form method="post" viewTransition className="w-full">
          <TextInput
            id="email"
            name="email"
            label="Email"
            type="email"
            required={true}
            autoComplete="email"
            inputClassName="text-lg px-4 py-3 rounded-xl border border-foreground/20"
          />
          {actionData?.error ? (
            <>
              <Spacer size="sm" />
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
                {actionData.error}
              </div>
            </>
          ) : null}
          {actionData?.success ? (
            <>
              <Spacer size="sm" />
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-base text-green-700">
                {actionData.success}
              </div>
            </>
          ) : null}
          <Spacer size="md" />
          <Button className="w-full text-lg px-4 py-3 rounded-xl" type="submit">
            Enviar link de redefinição
          </Button>
        </Form>
        <Spacer size="md" />
        <LinkButton to="/login" styleType="secondary" className="block w-full text-center text-lg px-4 py-3 rounded-xl">
          Voltar ao login
        </LinkButton>
        </div>
      </Center>
    </>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData()
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) {
    return data({ error: 'Informe seu email.' })
  }

  const user = await context.prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  })

  if (!user) {
    return data({
      success: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
    })
  }

  if (!user.password) {
    return data({
      error: 'Esta conta usa login com Google. Use o Google para entrar.',
    })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await context.prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  })

  const appUrl = getAppUrl(request)
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  const result = await sendPasswordResetEmail(email, resetUrl)

  if (!result.success) {
    return data({ error: result.error ?? 'Falha ao enviar email.' })
  }

  return data({
    success: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
  })
}
