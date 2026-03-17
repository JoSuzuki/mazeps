import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { Role, TournamentStatus } from '~/generated/prisma/enums'

export async function action({ context, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  await context.prisma.tournament.update({
    where: { id: Number(params.tournamentId) },
    data: { status: TournamentStatus.TOURNAMENT_FINISHED },
  })

  return redirect(`/tournaments/${params.tournamentId}`)
}
