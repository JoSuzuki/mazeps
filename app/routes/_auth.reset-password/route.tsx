import bcrypt from 'bcrypt'
import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import Spacer from '~/components/spacer/spacer.component'
import TextInput from '~/components/text-input/text-input.component'

export async function loader({ context, request }: Route.LoaderArgs) {
  if (context.currentUser) return redirect('/')

  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return redirect('/forgot-password')
  }

  const resetToken = await context.prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return redirect('/forgot-password?expired=1')
  }

  return data({ valid: true })
}

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: 'Mazeps - Redefinir senha' }]
}

export default function Route({ actionData }: Route.ComponentProps) {
  return (
    <>
      <BackButtonPortal to="/login" />
      <Center className="align-center grid place-content-center text-lg">
        <h1 className="font-brand text-center text-3xl tracking-wide">
          Redefinir senha
        </h1>
        <p className="mt-2 text-center text-base text-foreground/60">
          Digite sua nova senha abaixo.
        </p>
        <Spacer size="md" />
        <div className="mx-auto w-full max-w-sm">
        <Form method="post" viewTransition className="w-full">
          <TextInput
            id="password"
            name="password"
            label="Nova senha"
            type="password"
            required={true}
            autoComplete="new-password"
            inputClassName="text-lg px-4 py-3 rounded-xl border border-foreground/20"
          />
          <Spacer size="sm" />
          <TextInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar senha"
            type="password"
            required={true}
            autoComplete="new-password"
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
          <Spacer size="md" />
          <Button className="w-full text-lg px-4 py-3 rounded-xl" type="submit">
            Redefinir senha
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
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return redirect('/forgot-password')
  }

  const formData = await request.formData()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return data({ error: 'As senhas não coincidem.' })
  }

  if (password.length < 6) {
    return data({ error: 'A senha deve ter pelo menos 6 caracteres.' })
  }

  const resetToken = await context.prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return data({ error: 'Link expirado. Solicite um novo link de redefinição.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await context.prisma.$transaction([
    context.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    context.prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    }),
  ])

  return redirect('/login?reset=1')
}
