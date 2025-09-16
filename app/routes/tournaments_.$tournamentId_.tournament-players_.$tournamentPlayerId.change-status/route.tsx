import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import { Role, TournamentPlayerStatus } from '~/generated/prisma/enums'

export async function action({ context, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  // Get the current tournament player
  const tournamentPlayer =
    await context.prisma.tournamentPlayer.findUniqueOrThrow({
      where: { id: Number(params.tournamentPlayerId) },
      select: { status: true },
    })

  // Toggle the status
  const newStatus =
    tournamentPlayer.status === TournamentPlayerStatus.ACTIVE
      ? TournamentPlayerStatus.DROPPED
      : TournamentPlayerStatus.ACTIVE

  // Update the tournament player status
  await context.prisma.tournamentPlayer.update({
    where: { id: Number(params.tournamentPlayerId) },
    data: { status: newStatus },
  })

  // Redirect back to the tournament player page
  return data({ success: true })
}
