import { useState } from 'react'
import { data, Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import TextInput from '~/components/text-input/text-input.component'
import { parseEventDate } from '~/lib/date'
import { EventStatus } from '~/lib/event-status'
import { EventType, Role } from '~/generated/prisma/enums'
import { AVAILABLE_BADGES } from '~/lib/badges'
import { resolveEventBadgeFile } from '~/lib/upload'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')
  return data(null)
}

export default function Route({ actionData }: Route.ComponentProps) {
  const [type, setType] = useState<EventType>(EventType.GENERAL)
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>(EventStatus.ABERTO)

  return (
    <>
      <BackButtonPortal to="/events" />
      <Center>
        <div className="mx-auto max-w-xl px-6 py-10">
          <header className="mb-10">
            <h1 className="font-brand text-3xl tracking-wide">Criar evento</h1>
            <p className="mt-2 text-foreground/70">
              Preencha os dados para cadastrar um novo evento ou torneio.
            </p>
          </header>

          <Form method="post" className="space-y-8">
            {actionData && 'error' in actionData && actionData.error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {actionData.error}
              </p>
            )}
            {/* Tipo */}
            <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Tipo
              </h2>
              <div className="flex gap-4">
                <label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 transition-all ${
                    type === EventType.GENERAL
                      ? 'border-primary bg-primary/10'
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={EventType.GENERAL}
                    className="sr-only"
                    checked={type === EventType.GENERAL}
                    onChange={() => setType(EventType.GENERAL)}
                  />
                  <span className="font-medium">Evento</span>
                </label>
                <label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 transition-all ${
                    type === EventType.TOURNAMENT
                      ? 'border-primary bg-primary/10'
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={EventType.TOURNAMENT}
                    className="sr-only"
                    checked={type === EventType.TOURNAMENT}
                    onChange={() => setType(EventType.TOURNAMENT)}
                  />
                  <span className="font-medium">Torneio</span>
                </label>
              </div>
            </section>

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
                  />
                </div>
                <TextInput
                  id="date"
                  name="date"
                  label="Data"
                  type="date"
                  required={false}
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
                {AVAILABLE_BADGES.map((badge) => (
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
              <div className="mt-4 space-y-2">
                <TextInput
                  id="badgeImgurUrl"
                  name="badgeImgurUrl"
                  label="Badge personalizada (link Imgur)"
                  type="text"
                  required={false}
                  placeholder="https://i.imgur.com/…"
                />
                <p className="text-xs text-foreground/50">
                  Para uma imagem própria, publique no Imgur e cole aqui um URL https. Tem prioridade
                  sobre a badge selecionada acima.
                </p>
              </div>
            </section>

            {/* Tamanho da mesa (torneio) */}
            {type === EventType.TOURNAMENT && (
              <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Configuração do torneio
                </h2>
                <TextInput
                  id="desiredTableSize"
                  name="desiredTableSize"
                  label="Tamanho da mesa"
                  type="number"
                  required={true}
                />
              </section>
            )}

            {/* Status */}
            <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Status
              </h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: EventStatus.SECRETO, label: 'Secreto', desc: 'Só admins veem' },
                  { value: EventStatus.ABERTO, label: 'Aberto', desc: 'Inscrições abertas' },
                  { value: EventStatus.ENCERRADO, label: 'Encerrado', desc: 'Inscrições fechadas' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-1 min-w-[100px] cursor-pointer flex-col rounded-xl border-2 px-4 py-3 transition-all ${
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
                    <span className="mt-0.5 text-xs text-foreground/50">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Ações */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <LinkButton
                to="/events"
                styleType="secondary"
                className="order-2 sm:order-1"
                viewTransition
              >
                Cancelar
              </LinkButton>
              <Button type="submit" className="order-1 sm:order-2">
                Criar evento
              </Button>
            </div>
          </Form>
        </div>
      </Center>
    </>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Apenas admins podem criar eventos' })
  }

  const formData = await request.formData()
  const type = formData.get('type') as EventType
  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const dateRaw = formData.get('date') as string
  const badgeResult = await resolveEventBadgeFile(formData)
  if (!badgeResult.ok) {
    return data({ error: badgeResult.error })
  }
  const badgeFile = badgeResult.badgeFile

  const statusRaw = formData.get('status') as string
  const validStatuses = [
    EventStatus.SECRETO,
    EventStatus.ABERTO,
    EventStatus.ENCERRADO,
  ]
  const status = validStatuses.includes(statusRaw) ? statusRaw : EventStatus.ABERTO

  const eventData = {
    name,
    description,
    date: dateRaw ? parseEventDate(dateRaw) : null,
    badgeFile,
    status,
    type,
  }

  if (type === EventType.TOURNAMENT) {
    const desiredTableSize = Number(formData.get('desiredTableSize'))
    const tournament = await context.prisma.tournament.create({
      data: {
        name,
        desiredTableSize,
        event: { create: eventData },
      },
    })
    return redirect(`/tournaments/${tournament.id}`)
  }

  const event = await context.prisma.event.create({ data: eventData })
  return redirect(`/events/${event.id}`)
}
