import { data, redirect } from 'react-router'
import type { Route } from '../+types/_base-layout'
import type { Round } from '~/generated/prisma/client'
import { Role, TournamentStatus } from '~/generated/prisma/enums'

async function createRound(
  context: Route.ActionArgs['context'],
  tournamentId: number,
): Promise<Round> {
  let lastRound = await context.prisma.round.findFirst({
    where: { tournamentId: Number(tournamentId) },
    orderBy: { roundNumber: 'desc' },
  })

  const newRound = await context.prisma.round.create({
    data: {
      tournamentId: Number(tournamentId),
      roundNumber: (lastRound.roundNumber ?? 0) + 1,
    },
  })

  return newRound
}

export async function action({ context, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  // Get the tournament to check current status and players
  let tournament = await context.prisma.tournament.findUniqueOrThrow({
    where: { id: Number(params.tournamentId) },
    include: {
      players: { include: { user: { select: { nickname: true } } } },
    },
  })

  await context.prisma.tournament.update({
    where: { id: Number(params.tournamentId) },
    data: {
      status: TournamentStatus.OPEN_ROUND,
    },
  })

  const newRound = await createRound(context, Number(params.tournamentId))

  return data({ success: true })
}
