import { data, redirect } from 'react-router'
import type { Route } from './+types/route'

export async function action({ params, context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  const eventId = Number(params.eventId)
  const userId = context.currentUser.id

  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { type: true, tournament: { select: { id: true } } },
  })

  await context.prisma.eventParticipant.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: {},
    create: { eventId, userId },
  })

  if (event.type === 'TOURNAMENT' && event.tournament) {
    await context.prisma.tournamentPlayer.upsert({
      where: { tournamentId_userId: { tournamentId: event.tournament.id, userId } },
      update: {},
      create: { tournamentId: event.tournament.id, userId },
    })
  }

  return data({ success: true })
}
