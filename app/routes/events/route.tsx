import { useFetcher } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { formatEventDate } from '~/lib/date'
import { EventStatus } from '~/lib/event-status'
import { EventType, Role } from '~/generated/prisma/enums'

const eventInclude = (currentUser: { id: string } | null) => ({
  tournament: { select: { id: true, status: true } },
  ...(currentUser && {
    participants: {
      where: { userId: currentUser.id },
    },
  }),
})

export async function loader({ context }: Route.LoaderArgs) {
  const canSeeSecretEvents =
    context.currentUser?.role === Role.ADMIN ||
    context.currentUser?.role === Role.STAFF

  const closedStatusFilter = canSeeSecretEvents
    ? { status: { in: [EventStatus.ENCERRADO, EventStatus.SECRETO] as const } }
    : { status: EventStatus.ENCERRADO }

  const [openEvents, closedEvents] = await Promise.all([
    context.prisma.event.findMany({
      where: { status: EventStatus.ABERTO },
      orderBy: { date: 'desc' },
      include: eventInclude(context.currentUser),
    }),
    context.prisma.event.findMany({
      where: closedStatusFilter,
      orderBy: { date: 'desc' },
      include: eventInclude(context.currentUser),
    }),
  ])

  // Garantir mais recentes primeiro; eventos sem data vão para o final
  const sortByDateDesc = <T extends { date: Date | null }>(a: T, b: T) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0
    const timeB = b.date ? new Date(b.date).getTime() : 0
    return timeB - timeA
  }
  openEvents.sort(sortByDateDesc)
  closedEvents.sort(sortByDateDesc)

  return {
    openEvents,
    closedEvents,
    currentUser: context.currentUser,
    canSeeSecretEvents,
  }
}

const EVENT_TYPE_LABEL: Record<EventType, string> = {
  [EventType.TOURNAMENT]: 'Torneio',
  [EventType.GENERAL]: 'Evento',
}

const STATUS_STYLES = {
  [EventStatus.SECRETO]: 'bg-amber-100 text-amber-800 border-amber-200',
  [EventStatus.ABERTO]: 'bg-green-100 text-green-800 border-green-200',
  [EventStatus.ENCERRADO]: 'bg-red-100 text-red-800 border-red-200',
} as const

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher()

  type EventItem = (typeof loaderData.openEvents)[0]
  const getEventLink = (event: EventItem) => {
    if (
      event.type === EventType.TOURNAMENT &&
      event.tournament &&
      loaderData.currentUser?.role !== Role.ADMIN
    ) {
      return `/tournaments/${event.tournament.id}`
    }
    return `/events/${event.id}`
  }

  const renderAction = (event: EventItem) => {
    if (event.type === EventType.TOURNAMENT) {
      const alreadyEnrolled =
        loaderData.currentUser && (event.participants?.length ?? 0) > 0
      return alreadyEnrolled ? (
        <span className="text-sm font-medium text-foreground/60">Inscrito</span>
      ) : (
        <Link
          to={event.tournament ? `/tournaments/${event.tournament.id}` : `/events/${event.id}`}
          viewTransition
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Ir para tabela e mesas
        </Link>
      )
    }

    if (!loaderData.currentUser) return null
    if (event.status !== EventStatus.ABERTO) return null

    const checkedIn = (event.participants?.length ?? 0) > 0
    if (checkedIn) {
      return (
        <span className="text-sm font-medium text-foreground/60">Participando</span>
      )
    }

    return (
      <fetcher.Form method="post" action={`/events/${event.id}/check-in`}>
        <Button styleType="secondary" type="submit" className="text-sm">
          Check-in
        </Button>
      </fetcher.Form>
    )
  }

  return (
    <>
      <BackButtonPortal to="/" />
      <Center>
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Header */}
          <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-brand text-4xl tracking-wide">Eventos</h1>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-foreground/60">
                Próximos eventos e torneios
              </p>
            </div>
            {loaderData.currentUser?.role === Role.ADMIN && (
              <LinkButton
                styleType="primary"
                to="/events/new"
                viewTransition
                className="shrink-0"
              >
                Criar evento
              </LinkButton>
            )}
          </header>

          {/* Caixa 1: Eventos e torneios abertos */}
          <section className="mb-8 overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm">
            <div className="flex items-center justify-between border-b border-foreground/10 bg-foreground/5 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                Abertos
              </h2>
              <p className="text-sm text-foreground/60">
                <span className="font-semibold text-foreground/80">
                  {loaderData.openEvents.length}
                </span>{' '}
                {loaderData.openEvents.length === 1 ? 'evento' : 'eventos'}
              </p>
            </div>

            {loaderData.openEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <p className="text-sm text-foreground/50">
                  Nenhum evento ou torneio aberto no momento.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-foreground/10 bg-foreground/5">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Evento
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Tipo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Data
                        </th>
                        {loaderData.canSeeSecretEvents && (
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                            Status
                          </th>
                        )}
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {loaderData.openEvents.map((event) => (
                        <tr
                          key={event.id}
                          className="transition-colors hover:bg-foreground/5"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={getEventLink(event)}
                              viewTransition
                              className="flex items-center gap-4"
                            >
                              {event.badgeFile ? (
                                <img
                                  src={event.badgeFile}
                                  alt={`Badge de ${event.name}`}
                                  className="h-20 w-20 shrink-0 object-contain"
                                />
                              ) : (
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-foreground/5">
                                  <CalendarIcon className="text-foreground/30" />
                                </div>
                              )}
                              <span className="font-medium hover:underline">
                                {event.name}
                              </span>
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full border border-foreground/20 bg-foreground/5 px-2.5 py-1 text-xs font-medium uppercase tracking-wider">
                              {EVENT_TYPE_LABEL[event.type]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground/80">
                            {event.date
                              ? formatEventDate(event.date)
                              : '—'}
                          </td>
                          {loaderData.canSeeSecretEvents && (
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                  STATUS_STYLES[event.status] ??
                                  STATUS_STYLES[EventStatus.ABERTO]
                                }`}
                              >
                                {event.status === EventStatus.SECRETO
                                  ? 'Secreto'
                                  : event.status === EventStatus.ABERTO
                                    ? 'Aberto'
                                    : 'Encerrado'}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4 text-right">
                            {renderAction(event)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-foreground/10 md:hidden">
                  {loaderData.openEvents.map((event) => {
                    const action = renderAction(event)
                    return (
                      <div
                        key={event.id}
                        className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-foreground/5"
                      >
                        <Link
                          to={getEventLink(event)}
                          viewTransition
                          className="flex min-w-0 items-start gap-4"
                        >
                          {event.badgeFile ? (
                            <img
                              src={event.badgeFile}
                              alt={`Badge de ${event.name}`}
                              className="h-24 w-24 shrink-0 object-contain"
                            />
                          ) : (
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-foreground/5">
                              <CalendarIcon className="text-foreground/30" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{event.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium uppercase">
                                {EVENT_TYPE_LABEL[event.type]}
                              </span>
                              {loaderData.canSeeSecretEvents && (
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                                    STATUS_STYLES[event.status] ??
                                    STATUS_STYLES[EventStatus.ABERTO]
                                  }`}
                                >
                                  {event.status === EventStatus.SECRETO
                                    ? 'Secreto'
                                    : event.status === EventStatus.ABERTO
                                      ? 'Aberto'
                                      : 'Encerrado'}
                                </span>
                              )}
                              {event.date && (
                                <span className="text-xs text-foreground/50">
                                  {formatEventDate(event.date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                        {action && (
                          <div className="flex justify-end border-t border-foreground/5 pt-3">
                            {action}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </section>

          {/* Caixa 2: Eventos encerrados e secretos */}
          <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm">
            <div className="flex items-center justify-between border-b border-foreground/10 bg-foreground/5 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                Encerrados e secretos
              </h2>
              <p className="text-sm text-foreground/60">
                <span className="font-semibold text-foreground/80">
                  {loaderData.closedEvents.length}
                </span>{' '}
                {loaderData.closedEvents.length === 1 ? 'evento' : 'eventos'}
              </p>
            </div>

            {loaderData.closedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <p className="text-sm text-foreground/50">
                  Nenhum evento encerrado ou secreto.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-foreground/10 bg-foreground/5">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Evento
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Tipo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Data
                        </th>
                        {loaderData.canSeeSecretEvents && (
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                            Status
                          </th>
                        )}
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {loaderData.closedEvents.map((event) => (
                        <tr
                          key={event.id}
                          className="transition-colors hover:bg-foreground/5"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={getEventLink(event)}
                              viewTransition
                              className="flex items-center gap-4"
                            >
                              {event.badgeFile ? (
                                <img
                                  src={event.badgeFile}
                                  alt={`Badge de ${event.name}`}
                                  className="h-20 w-20 shrink-0 object-contain"
                                />
                              ) : (
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-foreground/5">
                                  <CalendarIcon className="text-foreground/30" />
                                </div>
                              )}
                              <span className="font-medium hover:underline">
                                {event.name}
                              </span>
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full border border-foreground/20 bg-foreground/5 px-2.5 py-1 text-xs font-medium uppercase tracking-wider">
                              {EVENT_TYPE_LABEL[event.type]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground/80">
                            {event.date
                              ? formatEventDate(event.date)
                              : '—'}
                          </td>
                          {loaderData.canSeeSecretEvents && (
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                  STATUS_STYLES[event.status] ??
                                  STATUS_STYLES[EventStatus.ABERTO]
                                }`}
                              >
                                {event.status === EventStatus.SECRETO
                                  ? 'Secreto'
                                  : event.status === EventStatus.ABERTO
                                    ? 'Aberto'
                                    : 'Encerrado'}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4 text-right">
                            {renderAction(event)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-foreground/10 md:hidden">
                  {loaderData.closedEvents.map((event) => {
                    const action = renderAction(event)
                    return (
                      <div
                        key={event.id}
                        className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-foreground/5"
                      >
                        <Link
                          to={getEventLink(event)}
                          viewTransition
                          className="flex min-w-0 items-start gap-4"
                        >
                          {event.badgeFile ? (
                            <img
                              src={event.badgeFile}
                              alt={`Badge de ${event.name}`}
                              className="h-24 w-24 shrink-0 object-contain"
                            />
                          ) : (
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-foreground/5">
                              <CalendarIcon className="text-foreground/30" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{event.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium uppercase">
                                {EVENT_TYPE_LABEL[event.type]}
                              </span>
                              {loaderData.canSeeSecretEvents && (
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                                    STATUS_STYLES[event.status] ??
                                    STATUS_STYLES[EventStatus.ABERTO]
                                  }`}
                                >
                                  {event.status === EventStatus.SECRETO
                                    ? 'Secreto'
                                    : event.status === EventStatus.ABERTO
                                      ? 'Aberto'
                                      : 'Encerrado'}
                                </span>
                              )}
                              {event.date && (
                                <span className="text-xs text-foreground/50">
                                  {formatEventDate(event.date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                        {action && (
                          <div className="flex justify-end border-t border-foreground/5 pt-3">
                            {action}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </Center>
    </>
  )
}
