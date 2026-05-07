import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import { Role } from '~/generated/prisma/enums'
import { canUserSelfEnrollInTournament } from '~/lib/tournament-enrollment'

export async function action({ params, context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  const tournamentId = Number(params.tournamentId)
  const userId = context.currentUser.id

  const tournament = await context.prisma.tournament.findUniqueOrThrow({
    where: { id: tournamentId },
    select: {
      status: true,
      event: { select: { id: true, status: true } },
    },
  })

  if (
    !canUserSelfEnrollInTournament({
      role: context.currentUser.role,
      tournamentStatus: tournament.status,
      eventStatus: tournament.event?.status,
    })
  ) {
    return data(
      { error: 'As inscrições para este torneio estão encerradas.' },
      { status: 403 },
    )
  }

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
