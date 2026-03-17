import { useState } from 'react'
import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import TextInput from '~/components/text-input/text-input.component'
import { EventStatus } from '~/lib/event-status'
import { Role } from '~/generated/prisma/enums'
import { AVAILABLE_BADGES } from '~/lib/badges'
import { saveUploadedFile } from '~/lib/upload'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: Number(params.eventId) },
  })

  // ADMIN pode editar qualquer evento; STAFF só eventos abertos (não SECRETO)
  const canEdit =
    context.currentUser.role === Role.ADMIN ||
    (context.currentUser.role === Role.STAFF &&
      event.status === EventStatus.ABERTO)

  if (!canEdit) return redirect(`/events/${params.eventId}`)

  // Apenas ADMIN pode alterar status; STAFF não
  const canChangeStatus = context.currentUser.role === Role.ADMIN
  const isAdmin = context.currentUser.role === Role.ADMIN

  return { event, canChangeStatus, isAdmin }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const { event, canChangeStatus, isAdmin } = loaderData
  const badgeOptions = [
    ...AVAILABLE_BADGES,
    ...(event.badgeFile &&
    !AVAILABLE_BADGES.some((b) => b.path === event.badgeFile)
      ? [{ label: 'Personalizado', path: event.badgeFile }]
      : []),
  ]
  const [selectedBadge, setSelectedBadge] = useState<string | null>(
    event.badgeFile,
  )
  const [selectedStatus, setSelectedStatus] = useState<string>(event.status)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BackButtonPortal to={`/events/${params.eventId}`} />
      <Center>
        <div className="mx-auto max-w-xl px-6 py-10">
          <header className="mb-10">
            <h1 className="font-brand text-3xl tracking-wide">Editar evento</h1>
            <p className="mt-2 text-foreground/70">
              Atualize as informações de {event.name}.
            </p>
          </header>

          <Form method="post" encType="multipart/form-data" className="space-y-8">
            {/* Dados básicos */}
            <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Dados básicos
              </h2>
              <div className="space-y-5">
                <TextInput
                  id="name"
                  name="name"
                  label="Nome"
                  type="text"
                  required={true}
                  defaultValue={event.name}
                />
                <div>
                  <label className="block" htmlFor="description">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="mt-1 w-full rounded-xl border border-foreground/20 bg-background px-4 py-3 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={4}
                    placeholder="Descreva o evento..."
                    defaultValue={event.description ?? ''}
                  />
                </div>
                <TextInput
                  id="date"
                  name="date"
                  label="Data"
                  type="date"
                  required={false}
                  defaultValue={
                    event.date
                      ? new Date(event.date).toISOString().slice(0, 10)
                      : ''
                  }
                />
              </div>
            </section>

            {/* Badge */}
            <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Badge
              </h2>
              <div className="flex flex-wrap gap-4">
                <label
                  className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 transition-all ${
                    selectedBadge === null
                      ? 'border-primary bg-primary/10'
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="badgeFile"
                    value=""
                    className="sr-only"
                    checked={selectedBadge === null}
                    onChange={() => setSelectedBadge(null)}
                  />
                  <span className="text-xs text-foreground/50">Nenhum</span>
                </label>
                {badgeOptions.map((badge) => (
                  <label
                    key={badge.path}
                    className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-all ${
                      selectedBadge === badge.path
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                        : 'border-foreground/10 hover:border-foreground/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="badgeFile"
                      value={badge.path}
                      className="sr-only"
                      checked={selectedBadge === badge.path}
                      onChange={() => setSelectedBadge(badge.path)}
                    />
                    <img
                      src={badge.path}
                      alt={badge.label}
                      title={badge.label}
                      className="h-full w-full object-contain p-1"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  htmlFor="badgeUpload"
                >
                  <input
                    id="badgeUpload"
                    name="badgeUpload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                  />
                  Enviar imagem personalizada
                </label>
              </div>
            </section>

            {/* Status (apenas ADMIN) */}
            {canChangeStatus ? (
              <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Status
                </h2>
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      value: EventStatus.SECRETO,
                      label: 'Secreto',
                      desc: 'Só admins veem',
                    },
                    {
                      value: EventStatus.ABERTO,
                      label: 'Aberto',
                      desc: 'Inscrições abertas',
                    },
                    {
                      value: EventStatus.ENCERRADO,
                      label: 'Encerrado',
                      desc: 'Inscrições fechadas',
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex min-w-[100px] flex-1 cursor-pointer flex-col rounded-xl border-2 px-4 py-3 transition-all ${
                        selectedStatus === opt.value
                          ? 'border-primary bg-primary/10'
                          : 'border-foreground/10 hover:border-foreground/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={opt.value}
                        className="sr-only"
                        checked={selectedStatus === opt.value}
                        onChange={() => setSelectedStatus(opt.value)}
                      />
                      <span className="font-medium">{opt.label}</span>
                      <span className="mt-0.5 text-xs text-foreground/50">
                        {opt.desc}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            ) : (
              <input type="hidden" name="status" value={event.status} />
            )}

            {/* Ações */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <LinkButton
                to={`/events/${params.eventId}`}
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

          {/* Excluir evento (apenas ADMIN) */}
          {isAdmin && (
            <section className="mt-12 rounded-2xl border border-red-200 bg-red-50/50 p-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
                Zona de perigo
              </h2>
              <p className="mb-4 text-sm text-red-800/90">
                Excluir um evento remove todos os participantes e, se for torneio,
                todo o histórico de partidas. Esta ação não pode ser desfeita.
              </p>
              <Button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-100 text-red-800 hover:bg-red-200"
              >
                Excluir evento
              </Button>
            </section>
          )}

          {/* Modal de confirmação */}
          {showDeleteConfirm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <div
                className="max-w-md rounded-2xl border border-foreground/10 bg-background p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-brand text-xl">Excluir evento?</h3>
                <p className="mt-3 text-foreground/80">
                  Tem certeza que deseja excluir <strong>{event.name}</strong>?
                  Todos os participantes e dados serão removidos permanentemente.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    styleType="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Form
                    method="post"
                    className="flex-1"
                    onSubmit={() => setShowDeleteConfirm(false)}
                  >
                    <input type="hidden" name="intent" value="delete" />
                    <Button
                      type="submit"
                      className="w-full bg-red-600 text-white hover:bg-red-700"
                    >
                      Sim, excluir
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
          )}
        </div>
      </Center>
    </>
  )
}

export async function action({ request, context, params }: Route.ActionArgs) {
  if (!context.currentUser) {
    return data({ error: 'Não autorizado' })
  }

  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: Number(params.eventId) },
    select: { status: true, tournamentId: true },
  })

  const formData = await request.formData()
  const intent = formData.get('intent') as string | null

  if (intent === 'delete') {
    if (context.currentUser.role !== Role.ADMIN) {
      return data({ error: 'Apenas administradores podem excluir eventos' })
    }
    const eventId = Number(params.eventId)
    const tournamentId = event.tournamentId
    await context.prisma.event.delete({
      where: { id: eventId },
    })
    if (tournamentId) {
      await context.prisma.tournament.delete({
        where: { id: tournamentId },
      })
    }
    return redirect('/events')
  }

  const canEdit =
    context.currentUser.role === Role.ADMIN ||
    (context.currentUser?.role === Role.STAFF &&
      event.status === EventStatus.ABERTO)

  if (!canEdit) {
    return data({ error: 'Sem permissão para editar este evento' })
  }
  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const dateRaw = formData.get('date') as string
  const badgeUpload = formData.get('badgeUpload')
  let badgeFile: string | null =
    (formData.get('badgeFile') as string)?.trim() || null
  if (badgeUpload instanceof File && badgeUpload.size > 0) {
    badgeFile = await saveUploadedFile(badgeUpload, 'badges')
  }

  const statusRaw = formData.get('status') as string
  const validStatuses = [
    EventStatus.SECRETO,
    EventStatus.ABERTO,
    EventStatus.ENCERRADO,
  ]
  const status = validStatuses.includes(statusRaw) ? statusRaw : event.status

  await context.prisma.event.update({
    where: { id: Number(params.eventId) },
    data: {
      name,
      description,
      date: dateRaw ? new Date(dateRaw) : null,
      badgeFile,
      status,
    },
  })

  return redirect(`/events/${params.eventId}`)
}
