import bcrypt from 'bcrypt'
import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import TextInput from '~/components/text-input/text-input.component'
import { cookieUserFields, setSession } from '~/services/session'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const user = await context.prisma.user.findUnique({
    where: { id: context.currentUser.id },
    select: {
      id: true,
      name: true,
      nickname: true,
      email: true,
      password: true,
      instagram: true,
      birthday: true,
      favoriteGame: true,
      favoriteEvent: true,
    },
  })
  if (!user) return redirect('/login')

  const hasPassword = Boolean(user.password)
  const { password: _, ...userWithoutPassword } = user

  return {
    currentUser: userWithoutPassword,
    hasPassword,
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Route({ loaderData, actionData }: Route.ComponentProps) {
  const { currentUser, hasPassword } = loaderData

  return (
    <>
      <BackButtonPortal to="/profile" />
      <Center>
        <div className="mx-auto max-w-4xl px-6 py-10">
          <header className="mb-10">
            <h1 className="font-brand text-3xl tracking-wide">Editar perfil</h1>
            <p className="mt-2 text-foreground/70">
              Atualize suas informações pessoais.
            </p>
          </header>

          <Form method="post" className="space-y-8">
            {actionData?.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionData.error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Dados */}
              <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
                <div className="flex items-center gap-4 pb-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-foreground/20 bg-foreground/5 text-xl font-semibold">
                    {getInitials(currentUser.name)}
                  </div>
                  <div>
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-sm text-foreground/50">@{currentUser.nickname}</p>
                  </div>
                </div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Dados
                </h2>
                <div className="space-y-5">
                  <TextInput
                    id="name"
                    name="name"
                    label="Nome"
                    type="text"
                    required={true}
                    defaultValue={currentUser.name}
                  />
                  <TextInput
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    required={true}
                    defaultValue={currentUser.email}
                  />
                  <TextInput
                    id="nickname"
                    name="nickname"
                    label="Apelido"
                    type="text"
                    required={true}
                    defaultValue={currentUser.nickname}
                  />
                  <TextInput
                    id="instagram"
                    name="instagram"
                    label="Instagram"
                    type="text"
                    required={false}
                    defaultValue={currentUser.instagram ?? ''}
                    placeholder="@usuario"
                  />
                  <TextInput
                    id="birthday"
                    name="birthday"
                    label="Data de aniversário"
                    type="date"
                    required={false}
                    defaultValue={
                      currentUser.birthday
                        ? new Date(currentUser.birthday).toISOString().slice(0, 10)
                        : ''
                    }
                  />
                  <TextInput
                    id="favoriteGame"
                    name="favoriteGame"
                    label="Jogo favorito"
                    type="text"
                    required={false}
                    defaultValue={currentUser.favoriteGame ?? ''}
                  />
                  <TextInput
                    id="favoriteEvent"
                    name="favoriteEvent"
                    label="Evento favorito"
                    type="text"
                    required={false}
                    defaultValue={currentUser.favoriteEvent ?? ''}
                  />
                </div>
              </section>

              {/* Senha */}
              <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  {hasPassword ? 'Alterar senha' : 'Definir senha'}
                </h2>
                <p className="mb-4 text-sm text-foreground/60">
                  {hasPassword
                    ? 'Deixe em branco para manter a senha atual.'
                    : 'Defina uma senha para fazer login com email e senha.'}
                </p>
                <div className="space-y-5">
                  {hasPassword && (
                    <TextInput
                      id="currentPassword"
                      name="currentPassword"
                      label="Senha atual"
                      type="password"
                      required={false}
                      autoComplete="current-password"
                    />
                  )}
                  <TextInput
                    id="newPassword"
                    name="newPassword"
                    label={hasPassword ? 'Nova senha' : 'Senha'}
                    type="password"
                    required={false}
                    autoComplete="new-password"
                  />
                  <TextInput
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirmar senha"
                    type="password"
                    required={false}
                    autoComplete="new-password"
                  />
                </div>
              </section>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <LinkButton
                to="/profile"
                styleType="secondary"
                className="order-2 sm:order-1"
                viewTransition
              >
                Cancelar
              </LinkButton>
              <Button type="submit" className="order-1 sm:order-2">
                Salvar alterações
              </Button>
            </div>
          </Form>
        </div>
      </Center>
    </>
  )
}

export async function action({ context, request }: Route.ActionArgs) {
  if (!context.currentUser) {
    return data({
      error: 'É necessário estar logado para atualizar seus dados',
    })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const nickname = formData.get('nickname') as string
  const instagram = (formData.get('instagram') as string)?.trim() || null
  const birthdayStr = (formData.get('birthday') as string)?.trim() || null
  const favoriteGame = (formData.get('favoriteGame') as string)?.trim() || null
  const favoriteEvent = (formData.get('favoriteEvent') as string)?.trim() || null
  const currentPassword = (formData.get('currentPassword') as string) || ''
  const newPassword = (formData.get('newPassword') as string) || ''
  const confirmPassword = (formData.get('confirmPassword') as string) || ''

  const birthday = birthdayStr ? new Date(birthdayStr) : null

  const updateData = {
    name,
    email,
    nickname,
    instagram,
    birthday,
    favoriteGame,
    favoriteEvent,
  } as {
    name: string
    email: string
    nickname: string
    instagram: string | null
    birthday: Date | null
    favoriteGame: string | null
    favoriteEvent: string | null
    password?: string
  }

  if (newPassword || confirmPassword) {
    if (newPassword !== confirmPassword) {
      return data({ error: 'As senhas não coincidem.' })
    }
    if (newPassword.length < 6) {
      return data({ error: 'A senha deve ter pelo menos 6 caracteres.' })
    }

    const userWithPassword = await context.prisma.user.findUnique({
      where: { id: context.currentUser.id },
      select: { password: true },
    })
    const hasPassword = Boolean(userWithPassword?.password)

    if (hasPassword) {
      if (!currentPassword) {
        return data({ error: 'Informe a senha atual para alterar.' })
      }
      const match = await bcrypt.compare(
        currentPassword,
        userWithPassword!.password || '',
      )
      if (!match) {
        return data({ error: 'Senha atual incorreta.' })
      }
    }

    updateData.password = await bcrypt.hash(newPassword, 10)
  }

  const currentUser = await context.prisma.user.update({
    where: { id: context.currentUser.id },
    data: updateData,
    select: cookieUserFields,
  })

  return redirect('/profile', {
    headers: {
      'Set-Cookie': await setSession(request, currentUser),
    },
  })
}
