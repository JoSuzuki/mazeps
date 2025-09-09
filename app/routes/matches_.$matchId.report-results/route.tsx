import { data, redirect } from 'react-router'
import type { Route } from './+types/route'

export async function action({ request, context, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  const formData = await request.formData()

  console.log(formData)
  const matchId = Number(params.matchId)
  console.log(matchId)

  for (const [playerIdRaw, pointsRaw] of formData.entries()) {
    const playerId = Number(playerIdRaw)
    const points = Number(pointsRaw)

    console.log(playerId, points)

    await context.prisma.matchResult.upsert({
      where: { playerId_matchId: { playerId: playerId, matchId: matchId } },
      update: { points: points },
      create: { playerId: playerId, matchId: matchId, points: points },
    })
  }

  return data({ success: true })
}
