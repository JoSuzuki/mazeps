import { data, redirect } from 'react-router'
import type { Route } from './+types/route'

export async function action({ params, context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  const tournamentId = Number(params.tournamentId)
  const userId = context.currentUser.id

  const tournament = await context.prisma.tournament.findUniqueOrThrow({
    where: { id: tournamentId },
    select: { event: { select: { id: true } } },
  })

  await context.prisma.tournamentPlayer.create({
    data: { userId, tournamentId },
  })

  if (tournament.event) {
    await context.prisma.eventParticipant.upsert({
      where: { eventId_userId: { eventId: tournament.event.id, userId } },
      update: {},
      create: { eventId: tournament.event.id, userId },
    })
  }

  return data({ success: true })
}
