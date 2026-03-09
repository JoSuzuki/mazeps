import { data, useFetcher, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import { EventType, Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  const eventId = Number(params.eventId)
  const isAdmin = context.currentUser?.role === Role.ADMIN

  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: {
      tournament: { select: { id: true } },
      participants: { include: { user: { select: { id: true, nickname: true } } } },
    },
  })

  // Tournament events are managed via the tournament routes
  if (event.type === EventType.TOURNAMENT && event.tournament) {
    return redirect(`/tournaments/${event.tournament.id}`)
  }

  const currentParticipant = context.currentUser
    ? event.participants.find((p) => p.userId === context.currentUser!.id)
    : null

  const participantUserIds = new Set(event.participants.map((p) => p.userId))
  const eligibleUsers = isAdmin
    ? await context.prisma.user.findMany({
        where: { id: { notIn: [...participantUserIds] } },
        select: { id: true, nickname: true },
        orderBy: { nickname: 'asc' },
      })
    : []

  return { event, currentParticipant, currentUser: context.currentUser, isAdmin, eligibleUsers }
}

export async function action({ request, context, params }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Não autorizado' })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string

  if (intent === 'add-participant') {
    const userId = Number(formData.get('userId'))
    await context.prisma.eventParticipant.upsert({
      where: { eventId_userId: { eventId: Number(params.eventId), userId } },
      update: {},
      create: { eventId: Number(params.eventId), userId },
    })
    return data({ success: true })
  }

  if (intent === 'remove-participant') {
    const participantId = Number(formData.get('participantId'))
    await context.prisma.eventParticipant.delete({ where: { id: participantId } })
    return data({ success: true })
  }

  return data({ error: 'Ação inválida' })
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()
  const { event, currentParticipant, currentUser, isAdmin, eligibleUsers } = loaderData

  const checkedIn =
    !!currentParticipant ||
    event.participants.some((p) => p.userId === currentUser?.id)

  return (
    <>
      <div className="px-6 py-2">
        <Link to="/events" viewTransition>
          ← Voltar
        </Link>
      </div>
      <Center>
        <h1 className="flex justify-center text-lg">{event.name}</h1>
        <Spacer size="md" />

        {event.date && (
          <>
            <p className="text-sm opacity-60">
              {new Date(event.date).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <Spacer size="md" />
          </>
        )}

        {event.description && (
          <>
            <p className="leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
            <Spacer size="md" />
          </>
        )}

        {currentUser && !isAdmin && (
          <>
            {checkedIn ? (
              <p className="font-medium">Voce esta participando deste evento.</p>
            ) : (
              <fetcher.Form
                method="post"
                action={`/events/${params.eventId}/check-in`}
              >
                <Button type="submit">Check-in</Button>
              </fetcher.Form>
            )}
            <Spacer size="lg" />
          </>
        )}

        <h2 className="text-base font-semibold">
          Participantes ({event.participants.length})
        </h2>
        <Spacer size="sm" />
        {event.participants.length === 0 ? (
          <p className="text-sm opacity-60">Nenhum participante ainda.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {event.participants.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.user.nickname}</span>
                {isAdmin && (
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="remove-participant" />
                    <input type="hidden" name="participantId" value={p.id} />
                    <button
                      type="submit"
                      className="cursor-pointer text-red-500 text-xs hover:underline"
                      onClick={(e) => {
                        if (!confirm(`Remover ${p.user.nickname}?`)) e.preventDefault()
                      }}
                    >
                      Remover
                    </button>
                  </fetcher.Form>
                )}
              </li>
            ))}
          </ul>
        )}

        {isAdmin && (
          <>
            <Spacer size="lg" />
            <h2 className="text-base font-semibold">Adicionar participante</h2>
            <Spacer size="sm" />
            {eligibleUsers.length === 0 ? (
              <p className="text-sm opacity-60">Todos os usuários já estão participando.</p>
            ) : (
              <fetcher.Form method="post" className="flex gap-2">
                <input type="hidden" name="intent" value="add-participant" />
                <select
                  name="userId"
                  required
                  className="flex-1 rounded-md border-1 p-1 text-sm"
                >
                  <option value="">Selecionar usuário...</option>
                  {eligibleUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nickname}
                    </option>
                  ))}
                </select>
                <Button type="submit">Adicionar</Button>
              </fetcher.Form>
            )}
          </>
        )}
      </Center>
    </>
  )
}
