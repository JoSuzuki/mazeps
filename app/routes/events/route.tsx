import { useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Pagination from '~/components/pagination/pagination.component'
import Spacer from '~/components/spacer/spacer.component'
import Table from '~/components/table/table.component'
import { EventType, Role } from '~/generated/prisma/enums'

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || 1)
  const limit = 10
  const skip = (page - 1) * limit
  const hasUser = Boolean(context.currentUser)

  const [events, totalCount] = await Promise.all([
    hasUser
      ? context.prisma.event.findMany({
          skip,
          take: limit,
          orderBy: { date: 'asc' },
          include: {
            tournament: { select: { id: true, status: true } },
            participants: {
              where: { userId: context.currentUser!.id },
            },
          },
        })
      : context.prisma.event.findMany({
          skip,
          take: limit,
          orderBy: { date: 'asc' },
          include: {
            tournament: { select: { id: true, status: true } },
          },
        }),
    context.prisma.event.count(),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    events,
    currentUser: context.currentUser,
    pagination: { currentPage: page, totalPages, totalCount },
  }
}

const EVENT_TYPE_LABEL: Record<EventType, string> = {
  [EventType.TOURNAMENT]: 'Torneio',
  [EventType.GENERAL]: 'Evento',
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher()

  return (
    <>
      {loaderData.currentUser?.role === Role.ADMIN && (
        <div className="flex justify-end px-6 py-2">
          <LinkButton styleType="secondary" to="/events/new">
            Criar evento
          </LinkButton>
        </div>
      )}
      <Center>
        <h1 className="flex justify-center text-lg">Eventos</h1>
        <Spacer size="lg" />
        <Table
          emptyState="Não há eventos cadastrados ainda"
          data={loaderData.events}
          columns={[
            {
              key: 'badge',
              title: 'Badge',
              value: (event) =>
                event.badgeFile ? (
                  <img
                    src={event.badgeFile}
                    alt={`Badge de ${event.name}`}
                    className="h-10 w-10 object-contain"
                  />
                ) : null,
            },
            {
              key: 'name',
              title: 'Nome',
              value: (event) => (
                <Link
                  to={
                    event.type === EventType.TOURNAMENT &&
                    event.tournament &&
                    loaderData.currentUser?.role !== Role.ADMIN
                      ? `/tournaments/${event.tournament.id}`
                      : `/events/${event.id}`
                  }
                  viewTransition
                >
                  {event.name}
                </Link>
              ),
            },
            {
              key: 'type',
              title: 'Tipo',
              value: (event) => EVENT_TYPE_LABEL[event.type],
            },
            {
              key: 'date',
              title: 'Data',
              value: (event) =>
                event.date
                  ? new Date(event.date).toLocaleDateString('pt-BR')
                  : '—',
            },
            {
              key: 'action',
              title: 'Ações',
              value: (event) => {
                if (event.type === EventType.TOURNAMENT) {
                  const alreadyEnrolled =
                    loaderData.currentUser && event.participants.length > 0
                  return alreadyEnrolled ? (
                    <span>Inscrito</span>
                  ) : (
                    <Link
                      to={
                        event.tournament
                          ? `/tournaments/${event.tournament.id}`
                          : `/events/${event.id}`
                      }
                    >
                      Ver torneio
                    </Link>
                  )
                }

                if (!loaderData.currentUser) return null

                const checkedIn = event.participants.length > 0
                if (checkedIn) return <span>Participando</span>

                return (
                  <fetcher.Form
                    method="post"
                    action={`/events/${event.id}/check-in`}
                  >
                    <Button styleType="secondary" type="submit">
                      Check-in
                    </Button>
                  </fetcher.Form>
                )
              },
            },
          ]}
        />
        <Pagination
          currentPage={loaderData.pagination.currentPage}
          totalPages={loaderData.pagination.totalPages}
          baseUrl="/events"
        />
      </Center>
    </>
  )
}
