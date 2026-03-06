import { useFetcher, redirect } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import { EventType } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: Number(params.eventId) },
    include: {
      tournament: { select: { id: true } },
      participants: { include: { user: { select: { nickname: true } } } },
    },
  })

  // Tournament events are managed via the tournament routes
  if (event.type === EventType.TOURNAMENT && event.tournament) {
    return redirect(`/tournaments/${event.tournament.id}`)
  }

  const currentParticipant = context.currentUser
    ? event.participants.find((p) => p.userId === context.currentUser!.id)
    : null

  return { event, currentParticipant, currentUser: context.currentUser }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()
  const { event, currentParticipant, currentUser } = loaderData

  const checkedIn =
    !!currentParticipant ||
    loaderData.event.participants.some((p) => p.userId === currentUser?.id)

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

        {currentUser && (
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
          <ol className="list-inside list-decimal text-sm">
            {event.participants.map((p) => (
              <li key={p.id}>{p.user.nickname}</li>
            ))}
          </ol>
        )}
      </Center>
    </>
  )
}
