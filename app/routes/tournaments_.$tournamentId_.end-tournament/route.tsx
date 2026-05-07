import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { EventStatus, Role, TournamentStatus } from '~/generated/prisma/enums'

export async function action({ context, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const tournamentId = Number(params.tournamentId)
  const tournament = await context.prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: TournamentStatus.TOURNAMENT_FINISHED },
    select: { event: { select: { id: true } } },
  })

  if (tournament.event) {
    await context.prisma.event.update({
      where: { id: tournament.event.id },
      data: { status: EventStatus.ENCERRADO },
    })
  }

  return redirect(`/tournaments/${params.tournamentId}`)
}
