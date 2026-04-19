import { useState } from 'react'
import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import TextInput from '~/components/text-input/text-input.component'
import ThemedCheckbox from '~/components/themed-checkbox/themed-checkbox.component'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'
import { Role } from '~/generated/prisma/enums'
import { isPrismaMissingDbColumnError } from '~/lib/prisma-missing-column.server'

const CONFIRM_DELETE_TEXT = 'EXCLUIR'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (
    context.currentUser.role !== Role.ADMIN &&
    context.currentUser.id !== Number(params.userId)
  ) {
    return redirect('/')
  }

  const userId = Number(params.userId)
  let user
  try {
    user = await context.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    })
  } catch (e) {
    if (!isPrismaMissingDbColumnError(e)) throw e
    const u = await context.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      omit: { isSupporter: true, isWriter: true },
    })
    user = { ...u, isSupporter: false, isWriter: false }
  }

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const canDeleteUser = isAdmin && currentUser.id !== user.id

  return (
    <>
      <BackButtonPortal to={`/users/${user.id}`} />
      <Center>
        <div className="mx-auto max-w-xl px-6 py-10">
          <header className="mb-10">
            <h1 className="font-brand text-3xl tracking-wide">Editar usuário</h1>
            <p className="mt-2 text-foreground/70">
              Atualize as informações de{' '}
              <SupporterNameDisplay
                name={user.name}
                isSupporter={user.isSupporter}
                className="inline-flex max-w-full align-baseline"
              />
              .
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
                  <p className="font-medium">
                    <SupporterNameDisplay
                      name={user.name}
                      isSupporter={user.isSupporter}
                      nameClassName="font-medium"
                    />
                  </p>
                  <p className="text-sm text-foreground/50">
                    <SupporterNameDisplay
                      name={`@${user.nickname}`}
                      isSupporter={user.isSupporter}
                      nameClassName="text-sm text-foreground/50"
                    />
                  </p>
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
                    <ThemedCheckbox
                      name="isWriter"
                      value="on"
                      defaultChecked={user.isWriter}
                    />
                    <span className="text-sm">
                      Escritor (pode publicar no blog)
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-foreground/10 px-4 py-3 transition-colors hover:bg-foreground/5">
                    <ThemedCheckbox
                      name="isSupporter"
                      value="on"
                      defaultChecked={user.isSupporter}
                    />
                    <span className="text-sm">
                      Apoiador (tag pública; sem funções extras por enquanto)
                    </span>
                  </label>
                </div>
              </section>
            )}

            {isAdmin && (
              <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  E-mail com novidades
                </h2>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-foreground/10 px-4 py-3 transition-colors hover:bg-foreground/5">
                  <ThemedCheckbox
                    name="newsletterSubscribed"
                    value="on"
                    defaultChecked={user.newsletterSubscribed}
                  />
                  <span className="text-sm">
                    Deseja receber e-mails com novidades
                  </span>
                </label>
              </section>
            )}

            {/* Excluir usuário (apenas ADMIN, não pode excluir a si mesmo) */}
            {canDeleteUser && (
              <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-red-400">
                  Zona de perigo
                </h2>
                <p className="mb-4 text-sm text-red-600 dark:text-red-300">
                  Excluir este usuário é irreversível. Todos os dados associados serão removidos.
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(true)
                    setDeleteConfirmText('')
                  }}
                  className="border-red-300 bg-red-600 text-white hover:bg-red-700 dark:border-red-800 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Excluir usuário
                </Button>
              </section>
            )}

            {/* Ações */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              {isAdmin && (
                <LinkButton
                  to={`/users/${user.id}/profile-preview`}
                  styleType="secondary"
                  className="order-3 w-full sm:order-1 sm:mr-auto sm:w-auto"
                  viewTransition
                >
                  Ver perfil como utilizador
                </LinkButton>
              )}
              <LinkButton
                to={`/users/${user.id}`}
                styleType="secondary"
                className="order-2 sm:order-2"
                viewTransition
              >
                Cancelar
              </LinkButton>
              <Button type="submit" className="order-1 sm:order-3">
                Salvar alterações
              </Button>
            </div>
          </Form>

          {/* Modal de confirmação de exclusão */}
          {showDeleteModal && canDeleteUser && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <div
                className="max-w-md rounded-2xl border border-foreground/10 bg-background p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-brand text-xl text-red-600 dark:text-red-400">
                  Excluir usuário?
                </h3>
                <p className="mt-3 text-foreground/80">
                  Esta ação é irreversível. Para confirmar, digite{' '}
                  <strong className="font-mono">{CONFIRM_DELETE_TEXT}</strong>{' '}
                  abaixo:
                </p>
                <Form
                  method="post"
                  action={`/users/${user.id}/edit`}
                  className="mt-4 space-y-4"
                >
                  <input type="hidden" name="intent" value="delete-user" />
                  <input
                    type="text"
                    name="confirmDelete"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={CONFIRM_DELETE_TEXT}
                    className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-3 font-mono uppercase placeholder:normal-case placeholder:text-foreground/40 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    autoComplete="off"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      styleType="secondary"
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={deleteConfirmText !== CONFIRM_DELETE_TEXT}
                      className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"
                    >
                      Excluir
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          )}
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
  const intent = formData.get('intent') as string | null

  if (intent === 'delete-user') {
    if (context.currentUser.role !== Role.ADMIN) {
      return data({ error: 'Apenas administradores podem excluir usuários' })
    }
    const userId = Number(params.userId)
    if (context.currentUser.id === userId) {
      return data({ error: 'Você não pode excluir sua própria conta' })
    }
    const confirmDelete = (formData.get('confirmDelete') as string)?.trim().toUpperCase()
    if (confirmDelete !== CONFIRM_DELETE_TEXT) {
      return data({
        error: `Digite ${CONFIRM_DELETE_TEXT} para confirmar a exclusão`,
      })
    }

    await context.prisma.$transaction(async (tx) => {
      const tournamentPlayerIds = (
        await tx.tournamentPlayer.findMany({
          where: { userId },
          select: { id: true },
        })
      ).map((p) => p.id)
      if (tournamentPlayerIds.length > 0) {
        await tx.matchResult.deleteMany({
          where: { playerId: { in: tournamentPlayerIds } },
        })
      }
      await tx.tournamentPlayer.deleteMany({ where: { userId } })
      await tx.eventParticipant.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    })

    return redirect('/users')
  }

  const actorIsAdmin = context.currentUser.role === Role.ADMIN
  const userId = Number(params.userId)

  const shared = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    nickname: formData.get('nickname') as string,
  }
  const adminExtras = actorIsAdmin
    ? {
        role: formData.get('role') as Role,
        isWriter: formData.get('isWriter') === 'on',
        isSupporter: formData.get('isSupporter') === 'on',
        newsletterSubscribed: formData.get('newsletterSubscribed') === 'on',
      }
    : null

  let user
  try {
    user = await context.prisma.user.update({
      where: { id: userId },
      data: adminExtras ? { ...shared, ...adminExtras } : shared,
    })
  } catch (e) {
    if (!adminExtras || !isPrismaMissingDbColumnError(e)) throw e
    user = await context.prisma.user.update({
      where: { id: userId },
      data: {
        ...shared,
        role: adminExtras.role,
        newsletterSubscribed: adminExtras.newsletterSubscribed,
      },
    })
  }

  return redirect(`/users/${user.id}`)
}
