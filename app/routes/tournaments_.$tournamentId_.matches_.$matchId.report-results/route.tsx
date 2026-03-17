import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { Role } from '~/generated/prisma/enums'

export async function action({ request, context, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  const canReport =
    context.currentUser.role === Role.ADMIN ||
    context.currentUser.role === Role.STAFF
  if (!canReport)
    return redirect(
      `/tournaments/${params.tournamentId}/matches/${params.matchId}`,
    )

  const formData = await request.formData()

  const matchId = Number(params.matchId)

  for (const [playerIdRaw, pointsRaw] of formData.entries()) {
    const playerId = Number(playerIdRaw)
    if (!Number.isInteger(playerId) || playerId <= 0) continue
    const points = Number(pointsRaw)

    await context.prisma.matchResult.upsert({
      where: { playerId_matchId: { playerId: playerId, matchId: matchId } },
      update: { points: points },
      create: { playerId: playerId, matchId: matchId, points: points },
    })
  }

  return redirect(`/tournaments/${params.tournamentId}`)
}
