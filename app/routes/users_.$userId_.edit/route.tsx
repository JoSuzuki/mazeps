import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import TextInput from '~/components/text-input/text-input.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (
    context.currentUser.role !== Role.ADMIN &&
    context.currentUser.id !== Number(params.userId)
  ) {
    return redirect('/')
  }

  const user = await context.prisma.user.findUniqueOrThrow({
    where: { id: Number(params.userId) },
  })

  return { user, currentUser: context.currentUser }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const { user, currentUser } = loaderData
  const isAdmin = currentUser.role === Role.ADMIN

  return (
    <>
      <BackButtonPortal to={`/users/${user.id}`} />
      <Center>
        <div className="mx-auto max-w-xl px-6 py-10">
          <header className="mb-10">
            <h1 className="font-brand text-3xl tracking-wide">Editar usuário</h1>
            <p className="mt-2 text-foreground/70">
              Atualize as informações de {user.name}.
            </p>
          </header>

          <Form method="post" className="space-y-8">
            {/* Dados básicos */}
            <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Dados
              </h2>
              <div className="flex items-center gap-4 pb-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-foreground/20 bg-foreground/5 text-xl font-semibold">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-foreground/50">@{user.nickname}</p>
                </div>
              </div>
              <div className="space-y-5">
                <TextInput
                  id="name"
                  name="name"
                  label="Nome"
                  type="text"
                  required={true}
                  defaultValue={user.name}
                />
                <TextInput
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  required={true}
                  defaultValue={user.email}
                />
                <TextInput
                  id="nickname"
                  name="nickname"
                  label="Apelido"
                  type="text"
                  required={true}
                  defaultValue={user.nickname}
                />
              </div>
            </section>

            {/* Permissões (apenas ADMIN) */}
            {isAdmin && (
              <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Permissões
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Role
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: Role.USER, label: 'Usuário' },
                        { value: Role.STAFF, label: 'Staff' },
                        { value: Role.ADMIN, label: 'Admin' },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex cursor-pointer items-center rounded-xl border-2 px-4 py-2.5 transition-all ${
                            user.role === opt.value
                              ? 'border-primary bg-primary/10'
                              : 'border-foreground/10 hover:border-foreground/20'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={opt.value}
                            className="sr-only"
                            defaultChecked={user.role === opt.value}
                          />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-foreground/10 px-4 py-3 transition-colors hover:bg-foreground/5">
                    <input
                      type="checkbox"
                      name="isWriter"
                      value="on"
                      defaultChecked={user.isWriter}
                      className="h-4 w-4 rounded border-foreground/30"
                    />
                    <span className="text-sm">
                      Escritor (pode publicar no blog)
                    </span>
                  </label>
                </div>
              </section>
            )}

            {/* Ações */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <LinkButton
                to={`/users/${user.id}`}
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

export async function action({ context, request, params }: Route.ActionArgs) {
  if (!context.currentUser) {
    return data({
      error: 'É necessário estar logado para atualizar seus dados',
    })
  }

  const formData = await request.formData()

  const user = await context.prisma.user.update({
    where: { id: Number(params.userId) },
    data: {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      nickname: formData.get('nickname') as string,
      ...(context.currentUser.role === Role.ADMIN && {
        role: formData.get('role') as Role,
        isWriter: formData.get('isWriter') === 'on',
      }),
    },
  })

  return redirect(`/users/${user.id}`)
}
